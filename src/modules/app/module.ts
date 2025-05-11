import { DatabaseModule } from "@/modules/database/module"
import { Module } from "@nestjs/common"
import { AppController } from "./controller"
import { AppService } from "./service"

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
