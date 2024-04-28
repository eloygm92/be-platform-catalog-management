import { Controller, Get, Param, Patch } from '@nestjs/common';
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

  @Get('config')
  getConfig(): Promise<any> {
    return this.appService.getConfig();
  }

  @Patch('config/:name/:value')
  setConfig(
    @Param('name') name: string,
    @Param('value') value: number,
  ): Promise<any> {
    return this.appService.setConfig(name, value);
  }
}
