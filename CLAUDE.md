# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` - Start Next.js development server on localhost:3000
- **Build**: `npm run build` - Create production build 
- **Start**: `npm run start` - Start production server
- **Lint**: `npm run lint` - Run ESLint checks

## Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4:

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Font System**: Uses Geist Sans and Geist Mono fonts from Google Fonts
- **File Structure**: 
  - `src/app/`: App Router directory containing pages and layouts
  - `src/app/layout.tsx`: Root layout with font configuration
  - `src/app/page.tsx`: Home page component
  - `public/`: Static assets (SVG icons)

## Key Technologies

- React 19.1.0
- Next.js App Router with TypeScript
- Tailwind CSS v4 (newer version with @tailwindcss/postcss)
- ESLint with Next.js configuration
- Font optimization with next/font

## Project Structure

The application follows Next.js App Router conventions:
- Server and client components are co-located in the app directory
- Global styles defined in `src/app/globals.css`
- Static assets served from `public/` directory
- Configuration files in root: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`

This is a fresh Next.js project created with create-next-app, so standard Next.js patterns and conventions apply.