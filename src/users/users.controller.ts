import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport'; // To be implemented

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  // @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'Return user found by email.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user found by ID.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get('id/:id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User successfully updated.' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User successfully deleted.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
