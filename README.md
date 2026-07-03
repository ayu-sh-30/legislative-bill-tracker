<!-- README.md -->

# Indian Legislative Bill Tracker

A full-stack app for tracking Indian legislative bills through the Lok Sabha and Rajya Sabha, viewing status timelines, comparing amended bill versions, and generating plain-English summaries with clause-level citations.

## Problem

Indian legislative information is spread across official sources, summaries, PDFs, and activity datasets. This project brings bill status, versions, timelines, and explanations into one searchable interface.

## Features

- Bill listing and detail pages
- Legislative status timeline
- Bill version tracking
- Clause and word-level diffing for amended versions
- LLM-generated plain-English summaries with clause references
- MP profile and activity views
- User authentication
- Follow bills for updates
- Notifications on stage changes

## Architecture

The project uses a monorepo structure:

- `apps/api`: Express + TypeScript backend
- `apps/web`: Next.js frontend
- `packages/shared-types`: shared TypeScript interfaces
- `docs`: architecture notes, progress log, and screenshots

## Tech Stack

- Frontend: Next.js, TypeScript
- Backend: Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT
- Scraping/fetching: Node.js jobs
- AI summarization: LLM API integration
- Deployment: Vercel, Render/Railway, managed PostgreSQL

## Setup Instructions

Setup steps will be added incrementally as the project is built.

## Screenshots

Screenshots will be added during frontend development.

## Live Demo

Live demo link will be added after deployment.