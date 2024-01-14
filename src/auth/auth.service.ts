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

    return { tokens: tokens, user: { id: newUser.id, username: newUser.username, email: newUser.email  } };
  }

  async signIn(data: AuthDto) {
    const user = await this.userRepository.findOne({
      relations: ['role'],
      where: [{ username: data.username }, { deactivate_at: null }],
  });

    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) throw new BadRequestException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { tokens: tokens, user: { id: user.id, username: user.username, email: user.email, role: user.role.name  } };
  }

  async logout(userId: number | string) {
    const user = await this.userRepository.findOne({where: {id: Number(userId)}});
    user.refresh_token = null;
    await this.userRepository.save(user);
    return {message: 'Logout success'};
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
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
}
