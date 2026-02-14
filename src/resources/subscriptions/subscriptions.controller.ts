import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { CacheTTL } from '@nestjs/cache-manager';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';
import { Role, User } from '@prisma/client';
import { SuccesspaymentType } from './entities/subscription.entity';

@ApiTags('subscriptions')
@ApiBearerAuth()
@CacheTTL(50)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post()
  @ApiOperation({ summary: 'Subscribe to a product plan' })
  @ApiResponse({
    status: 201,
    description: 'The subscription has been successfully created.',
  })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.subscriptionsService.subscribeToPlanService(
      createSubscriptionDto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  @CacheTTL(20)
  async findAll() {
    return this.subscriptionsService.findAll();
  }


  @Get(':company_id/company')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company subscription' })
  @ApiResponse({ status: 200, description: 'this is the company subscription' })
  async getCompanySubsription(@Param('company_id') company_id: string) {
    return this.subscriptionsService.getCompanySubscription(company_id);
  }

  // unSBubscribe a company
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  @Patch(':subscription_id/company_id/company')
  @ApiOperation({ summary: 'Unsubscribe company from subscription' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'unsubscription done' })
  async unsubscribeCompany(@Param() params: string[], @Body() body: any) {
    return this.subscriptionsService.unsubscribeCompany({
      subscription_id: params[0],
      company_id: params[1],
    });
  }

  // upgrade plqn
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  @Patch(':subscription_id/revise')
  upgradeSubscriptionPlan(
    @Param('subscription_id') subscription_id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.upgradeSubscriptionPlan(
      subscription_id,
      updateSubscriptionDto,
    );
  }

  @Delete(':subscription_id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  remove(@Param('subscription_id') subscription_id: string) {
    return this.subscriptionsService.remove(subscription_id);
  }

  @Get('cancel_payment')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  @ApiOperation({ summary: 'sucessfully cancel subscription from paypal' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The subscription has been successfully created.',
  })
  async cancelPayPalPayment(@Body() subscriptionPayload: any, @CurrentUser() user?: Partial<User>) {
    return this.subscriptionsService.cancelPayPalPayment(subscriptionPayload, <string>user?.company_id);
  }

  @Post('success_payment')
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The subscription has been successfully created.',
  })
  @ApiOperation({ summary: 'successful subscription from paypal event' })
  successPayPalPayment(

    @Body() data: SuccesspaymentType,
    @CurrentUser() user?: Partial<User>,
  ) {

    console.log("\n\n company connected: ", user?.company_id);
    return this.subscriptionsService.successPayPalPayment(
      <string>user?.company_id,
      data,
    );
  }

  // get subscription details
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.PDG)
  @Get(':subscription_id')
  @ApiResponse({
    status: 200,
    description: 'Successfully fetch subscription details',
  })
  @ApiOperation({ summary: 'Get subscription details' })
  async getSubscriptionDetails(
    @Param('subscription_id') subscription_id: string,
    @CurrentUser() user: User,
  ) {
    return this.subscriptionsService.getSubscriptionDetails(
      user.company_id,
    );
  }
}
