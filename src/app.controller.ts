import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('SynchroMovie/:id?')
  getSyncroMovie(@Param('id') id?: number): Promise<any> {
    //return this.appService.handleTaskWatchableMovie();
    return this.appService.handleTaskMovie(id);
  }

  @Get('SynchroTv/:id?')
  getSyncroTv(@Param('id') id?: number): Promise<any> {
    //return this.appService.handleTaskWatchableTv();
    return this.appService.handleTaskTv(id);
  }
}
