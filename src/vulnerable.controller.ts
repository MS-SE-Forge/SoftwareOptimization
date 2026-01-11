import { Controller, Get, Post, Body, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import * as child_process from 'child_process';
import axios from 'axios';
import * as crypto from 'crypto';

@Controller('vulnerable')
export class VulnerableController {
  private client: MongoClient;
  private db: any;

  constructor() {
    // MongoDB for NoSQL Injection demo
    void this.initDb();
  }

  // VULNERABILITY: Use of hardcoded credentials in code (for connection string)
  // In a real app, this should be an env var. Here we use the generic one for demo.
  // We use direct MongoClient to allow NoSQL Injection demonstration.
  async initDb() {
    const url =
      process.env.DATABASE_URL ||
      'mongodb://localhost:27017/software_optimization';
    try {
      this.client = new MongoClient(url);
      await this.client.connect();

      this.db = this.client.db();
      console.log('Connected to MongoDB');

      // Seed some data
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      if (count === 0) {
        await usersCollection.insertMany([
          { username: 'admin', password: 'password123', role: 'admin' },
          { username: 'user', password: 'user123', role: 'user' },
        ]);
      }
    } catch (err) {
      console.error('DB Init Error:', err);
    }
  }

  @Get('sqli') // Kept path as 'sqli' but implementing NoSQLi
  async sqli(@Query('username') username: string) {
    if (!username) return 'Provide username';

    // VULNERABILITY: NoSQL Injection
    // Accepting arbitrary input that might be an object, allowing operator injection like {$ne: null}
    // usage: /vulnerable/sqli?username[$ne]=null
    const query = { username: username };
    console.log('Executing query:', query);

    try {
      const users = await this.db.collection('users').find(query).toArray();
      return users;
    } catch (err) {
      const error = err as Error;
      return { error: error.message };
    }
  }

  @Get('xss')
  xss(@Query('input') input: string) {
    // VULNERABILITY: Reflected XSS
    // Returning user input directly without sanitization
    return `<html><body><h1>Hello ${input}</h1></body></html>`;
  }

  @Get('read-file')
  readFile(@Query('path') path: string) {
    // VULNERABILITY: Path Traversal
    // Allowing user to specify any path to read
    try {
      return fs.readFileSync(path, 'utf8');
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      return { error: err.message };
    }
  }

  @Get('cmd-inject')
  cmdInject(@Query('cmd') cmd: string) {
    // VULNERABILITY: Command Injection
    // Executing user provided command
    return new Promise((resolve, reject) => {
      child_process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(stderr);
        } else {
          console.log(stdout, stderr);
          resolve(stdout);
        }
      });
    });
  }

  @Get('ssrf')
  async ssrf(@Query('url') url: string) {
    // VULNERABILITY: SSRF
    // Fetching user provided URL without validation
    // VULNERABILITY: Fetching arbitrary URLs supplied by user
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      const error = err as Error;
      return { error: error.message };
    }
  }

  // 6. Insecure Deserialization (A08:2021-Software and Data Integrity Failures)
  @Post('deserialize')
  deserialize(@Body('data') data: string) {
    // VULNERABILITY: Simulating unsafe deserialization (e.g. using eval)
    // NEVER DO THIS IN PRODUCTION

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return eval(`(${data})`);
  }

  // 7. Broken Access Control (A01:2021-Broken Access Control)
  @Get('admin-data')
  getAdminData(@Req() req: Request) {
    // VULNERABILITY: No check if user is actually admin
    return { sensitive: 'Admin Only Data', users: ['admin', 'user1'] };
  }

  // 8. Exposure of Sensitive Information (A05:2021-Security Misconfiguration)
  @Get('error-debug')
  debugError() {
    try {
      throw new Error('Database connection failed');
    } catch (e) {
      const error = e as Error;
      // VULNERABILITY: Returning full stack trace to user
      return error.stack;
    }
  }

  // 9. Weak Cryptography (A02:2021-Cryptographic Failures)
  @Get('weak-hash')
  weakHash(@Query('pass') pass: string) {
    // VULNERABILITY: Using weak hashing algorithm (MD5) simulation
    return crypto.createHash('md5').update(pass).digest('hex');
  }

  // 10. Unvalidated Redirects (Open Redirect)
  @Get('redirect')
  redirect(@Query('url') url: string, @Res() res: Response) {
    // VULNERABILITY: Redirecting to arbitrary user-supplied URL
    res.redirect(url);
  }
}
