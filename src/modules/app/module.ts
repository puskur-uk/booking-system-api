import { DatabaseModule } from "@/modules/database/module"
import { ProviderModule } from "@/modules/provider/module"
import { Module } from "@nestjs/common"
import { AppController } from "./controller"
import { AppService } from "./service"

@Module({
  imports: [DatabaseModule, ProviderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
