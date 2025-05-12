import { Module } from "@nestjs/common"
import { ProviderController } from "./controller"
import { ProviderRepository } from "./repository"
import { ProviderService } from "./service"

@Module({
  controllers: [ProviderController],
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderService],
})
export class ProviderModule {}
