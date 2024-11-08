import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { AuthDto, RegisterUserDto } from "./dto/create-auth.dto";
import { generateFromEmail } from 'unique-username-generator';
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "../user/dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import * as process from "process";
import { Role } from "../user/entities/role.entity";
import { JwtPayload } from "./strategies/accessToken.strategy";
import { sendChangePassword, sendCreatedUser } from "../helpers/sendgrid.helper";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const userExist = await this.userRepository.findOneBy({ username: createUserDto.username });

    if (userExist) {
      throw new BadRequestException('User already exists');
    }

    createUserDto.password =  await this.hashData(createUserDto.password);

    const newUser = this.userRepository.create(createUserDto);
    newUser.role  = await this.roleRepository.findOneBy({ name: 'user' });

    await this.userRepository.save(newUser);

    const tokens = await this.getTokens(newUser.id, newUser.username);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    const returnedData: any = { tokens: tokens, user: { id: newUser.id, username: newUser.username, email: newUser.email, avatar_img: newUser.avatar_img  } };

    if(newUser.providers.length > 0) {
      const createdUser = await this.userRepository.findOne({where: {id: newUser.id}, relations: ['providers']});
      returnedData.user.providers = createdUser.providers;
    }

    await sendCreatedUser(newUser.email, newUser.username);

    return returnedData;
  }

  async signIn(data: AuthDto) {
    const user = await this.userRepository.findOne({
      relations: ['role', 'providers'],
      where: [{ username: data.username }, { deactivate_at: null }],
  });

    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) throw new BadRequestException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { tokens: tokens, user: { id: user.id, username: user.username, email: user.email, role: user.role.name, providers: user.providers, avatar_img: user.avatar_img  } };
  }

  async logout(userId: number | string) {
    const user = await this.userRepository.findOne({where: {id: Number(userId)}});
    user.refresh_token = null;
    await this.userRepository.save(user);
    return {message: 'Logout success'};
  }

  hashData(data: string) {
    return bcrypt.hash(data, Number(process.env.SALT));
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    const user = await this.userRepository.findOne({where: {id: userId}});
    user.refresh_token = hashedRefreshToken;
    await this.userRepository.save(user);
  }

  async getTokens(userId: string | number, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, username }, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }),
      this.jwtService.signAsync({ sub: userId, username }, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async signInGoogle(user) {
    if (!user) throw new BadRequestException('Unauthenticated');

    const userExist = await this.findUserByEmail(user.email);

    if (!userExist) {
      return this.registerUserGoogle(user);
    }

    return this.generateJwt({
      sub: userExist.id,
      email: userExist.email,
    });
  }

  async registerUserGoogle(user: RegisterUserDto) {
    try {
      const newUser = this.userRepository.create(user);
      newUser.username = generateFromEmail(user.email, 5);

      await this.userRepository.save(newUser);

      return this.generateJwt({
        sub: newUser.id,
        email: newUser.email,
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) return null;

    return user;
  }

  async validateAdminUser(payload: JwtPayload) {
    const user = await this.userRepository.findOne({ relations: ['role'], where: { id: Number(payload.sub) }});

    return user?.role?.name === 'admin';
  }

  async refreshToken(refreshToken: string) {
    const decodeRefreshToken = await this.jwtService.decode(refreshToken);
    const user = await this.userRepository.findOne({where: {username: decodeRefreshToken['username']}});

    if (!user) throw new BadRequestException('Invalid refresh token');

    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });

    return { accessToken };
  }

  async generateChangeMail(email: string) {
    const user = await this.userRepository.findOne({where: {email: email}});

    if (!user) throw new BadRequestException('User does not exist');

    const token = await this.jwtService.signAsync({ sub: user.id, email: user.email }, { secret: process.env.CHANGE_PASSWORD_SECRET, expiresIn: process.env.CHANGE_PASSWORD_EXPIRATION });

    await sendChangePassword(email, user.username, token);

    return { token };
  }

  async changePassword(changeData: { token: string, password: string }) {
    const decodeToken = await this.jwtService.verifyAsync(changeData.token, { secret: process.env.CHANGE_PASSWORD_SECRET });

    if (!decodeToken) throw new BadRequestException('Invalid token');

    const user = await this.userRepository.findOne({where: {email: decodeToken['email']}});

    if (!user) throw new BadRequestException('User does not exist');

    user.password = await this.hashData(changeData.password);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
