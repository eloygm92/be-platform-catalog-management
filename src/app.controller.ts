import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('SynchroMovie')
  getSyncroMovie(): Promise<any> {
    return this.appService.handleTaskWatchableMovie();
  }

  @Get('SynchroTv')
  getSyncroTv(): Promise<any> {
    //return this.appService.handleTaskWatchableTv();
    return this.appService.handleTaskTv();
  }
}
