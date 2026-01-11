import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport'; // To be implemented

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }
}
