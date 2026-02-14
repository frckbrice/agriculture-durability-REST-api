import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHome(@Res() res: Response) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agriculture Durability REST API</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            background: url('https://images.unsplash.com/photo-1667900598245-6620cea1c04c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29jb2F8ZW58MHx8MHx8fDA%3D') center/cover no-repeat;
            font-family: 'Segoe UI', Arial, sans-serif;
          }
          .overlay {
            background: rgba(34,139,34,0.45); /* Reduced opacity for lighter overlay */
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .hero {
            background: rgba(255,255,255,0.12);
            border-radius: 24px;
            padding: 48px 32px;
            max-width: 600px;
            color: #fff;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            text-align: center;
          }
          .cta {
            display: inline-block;
            background: #fff;
            color: #228B22;
            font-weight: bold;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 1.1rem;
            text-decoration: none;
            box-shadow: 0 4px 16px rgba(34,139,34,0.15);
            margin-top: 2rem;
            transition: background 0.2s, color 0.2s;
          }
          .cta:hover {
            background: #228B22;
            color: #fff;
          }
          .footer {
            position: absolute;
            bottom: 24px;
            left: 0;
            width: 100%;
            text-align: center;
            color: #fff;
            font-size: 0.95rem;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          a.footer-link {
            color: #fff;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="overlay">
          <div class="hero">
            <h1 style="font-size:2.5rem;margin-bottom:1rem;">Agriculture Durability REST API</h1>
            <p style="font-size:1.2rem;margin-bottom:2rem;">
              Explore a robust RESTful API for sustainable cocoa farming, supply chain traceability, and compliance. Interact with the API using the OpenAPI specification for seamless integration and testing.
            </p>
            <a class="cta" href="https://cocoa-farming-apispec.vercel.app/" target="_blank" rel="noopener noreferrer">
              View API Documentation &rarr;
            </a>
          </div>
          <div class="footer">
            API Spec powered by <a class="footer-link" href="https://github.com/frckbrice/cocoa-farming-api_spec" target="_blank" rel="noopener noreferrer">cocoa-farming-api_spec</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
}
