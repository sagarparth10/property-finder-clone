import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PropertyModule } from './modules/property/property.module';
import { AgentModule } from './modules/agent/agent.module';
import { BrokerModule } from './modules/broker/broker.module';
import { LawyerModule } from './modules/lawyer/lawyer.module';
import { MortgageModule } from './modules/mortgage/mortgage.module';
import { ChatModule } from './modules/chat/chat.module';
import { AIServiceModule } from './modules/ai/ai.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CrmModule } from './modules/crm/crm.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-finder'),
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,
        limit: 120,
      }],
    }),
    AuthModule,
    UserModule,
    PropertyModule,
    AgentModule,
    BrokerModule,
    LawyerModule,
    MortgageModule,
    ChatModule,
    AIServiceModule,
    PaymentModule,
    CrmModule,
    SeedModule,
  ],
})
export class AppModule {}

