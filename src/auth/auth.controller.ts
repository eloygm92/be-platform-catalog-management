import { Controller, Get, UseGuards, Res, Req, HttpStatus, Post, Body, Patch } from "@nestjs/common";
import { AuthService } from './auth.service';
import { Response } from 'express'
import { GoogleOauthGuard } from "./guards/google-oauth.guard";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { AuthDto } from "./dto/create-auth.dto";
import { Request } from 'express';
import * as process from "process";
import { RefreshTokenGuard } from "./guards/refreshToken.guard";
import { ChangePasswordGuard } from "./guards/changePassword.guard";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response
  ) {
    const data = await this.authService.signUp(createUserDto);

    res.cookie('access_token', data['tokens']['accessToken'], {
      maxAge: Number((process.env.ACCESS_TOKEN_EXPIRATION).slice(0,-1)) * 1000,
      sameSite: 'strict',
      secure: true,
    })

    res.cookie('refresh_token', data['tokens']['refreshToken'], {
      maxAge: Number((process.env.REFRESH_TOKEN_EXPIRATION).slice(0,-1)) * 1000 * 60 * 60 * 24,
      sameSite: 'strict',
      secure: true,
    })

    return res.status(HttpStatus.CREATED).json(data['user']);
  }

  @Post('signin')
  async signIn(
    @Body() data: AuthDto,
    @Res() res: Response
  ) {
    const dataLogin = await this.authService.signIn(data);

    res.cookie('access_token', dataLogin['tokens']['accessToken'], {
      maxAge: Number((process.env.ACCESS_TOKEN_EXPIRATION).slice(0,-1)) * 1000,
      sameSite: 'strict',
      secure: true,
    })

    res.cookie('refresh_token', dataLogin['tokens']['refreshToken'], {
      maxAge: Number((process.env.REFRESH_TOKEN_EXPIRATION).slice(0,-1)) * 1000 * 60 * 60 * 24,
      sameSite: 'strict',
      secure: true,
    })

    return res.status(HttpStatus.CREATED).json(dataLogin['user']);
  }

  @Post('logout')
  logout(@Req() req: Request, @Body() body: { user: { sub: number | string } }) {
    return this.authService.logout(body.user.sub);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @Req() req: any,
    @Res() res: Response,
  ) {
    const token = await this.authService.signInGoogle(req.user);

    res.cookie('access_token', token, {
      maxAge: 2592000000,
      sameSite: 'strict',
      secure: true,
    });

    return res.status(HttpStatus.OK);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const { accessToken } = await this.authService.refreshToken(req.cookies['refresh_token']);

    res.cookie('access_token', accessToken, {
      maxAge: Number((process.env.ACCESS_TOKEN_EXPIRATION).slice(0,-1)) * 1000,
      sameSite: 'strict',
      secure: true,
    })

    return res.status(HttpStatus.OK).json({ accessToken });
  }

  @Post('forgot-password')
  async changeChangeMail(@Body() emailData: { email: string}) {
    return this.authService.generateChangeMail(emailData.email);
  }


  @Patch('change-password')
  @UseGuards(ChangePasswordGuard)
  async changePassword(@Body() changeData: { password: string, token: string}) {
    return this.authService.changePassword(changeData);
  }
}
