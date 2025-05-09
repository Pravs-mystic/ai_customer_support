# AI Chat App for Document querying
This chat app uses Generative AI to provide instant, accurate responses to your queries from any uploaded documents. Experience the power of AI-driven support with these features:

## Features:
1. Login and Upload your documents (pdf, txt, docx, md) and query the bot anything about those docs
2. You can add multiple files and remove them anytime
3. You can upload multiple files and store them in different knowledge abse folders. At anytime you can query all the documents present in a knowledge base by mentioning the name of the knowledge base in your prompt. (Eg: @kb:kb name your_prompt)
5. Use custom made tools like cover letter generator and meeting action items generator by giving the name of the tool (Eg: @tool:tool_name your_prompt)

## How to run
1. npm install
2. setup keys and env variables
3. run `npm run dev`


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
