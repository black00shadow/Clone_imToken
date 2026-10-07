import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChainsService } from '../chains/chains.service';
import { DappsService } from '../dapps/dapps.service';
import { AnnouncementsService } from '../announcements/announcements.service';
import { BannersService } from '../banners/banners.service';
import { RemoteConfigService } from '../remote-config/remote-config.service';
import { RiskAddressesService } from '../risk-addresses/risk-addresses.service';
import { AppVersionsService } from '../app-versions/app-versions.service';
import { TokensService } from '../tokens/tokens.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private chains: ChainsService,
    private tokens: TokensService,
    private dapps: DappsService,
    private announcements: AnnouncementsService,
    private banners: BannersService,
    private remoteConfig: RemoteConfigService,
    private riskAddresses: RiskAddressesService,
    private appVersions: AppVersionsService,
  ) {}

  @Get('bootstrap')
  async bootstrap(@Query('locale') locale = 'en', @Query('platform') platform = 'android') {
    const [chains, dapps, announcements, banners, config, version] = await Promise.all([
      this.chains.findAll(false),
      this.dapps.findAll(),
      this.announcements.findAll(),
      this.banners.findAll(),
      this.remoteConfig.getPublicConfig(),
      this.appVersions.getLatest(platform),
    ]);

    return {
      chains: chains.map(({ tokens, ...chain }) => ({
        ...chain,
        tokens: tokens.filter((t) => t.isEnabled),
      })),
      dapps: dapps.filter((d) => d.isEnabled),
      announcements: announcements.filter((a) => a.isEnabled && a.locale === locale),
      banners: banners.filter((b) => b.isEnabled && b.locale === locale),
      config: Object.fromEntries(config.map((c) => [c.key, c.value])),
      version,
    };
  }

  @Get('chains')
  getChains() {
    return this.chains.findAll(false);
  }

  @Get('tokens')
  getTokens(@Query('chainId') chainId?: string) {
    return this.tokens.findAll(chainId);
  }

  @Get('dapps')
  getDapps() {
    return this.dapps.findAll();
  }

  @Get('risk-check')
  checkRisk(@Query('address') address: string, @Query('chain') chain?: string) {
    return this.riskAddresses.checkAddress(address, chain);
  }

  @Get('version/:platform')
  getVersion(@Param('platform') platform: string) {
    return this.appVersions.getLatest(platform);
  }
}
