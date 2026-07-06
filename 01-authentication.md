# Ravora Product Requirements Document
## Volume 1 — Authentication System (Master Specification)

**Version:** 2.0

This document is the master specification for Ravora Authentication.

## Table of Contents
1. [Product Goals](#product-goals)
2. [User Journeys](#user-journeys)
3. [Authentication Architecture](#authentication-architecture)
4. [Sign In](#sign-in)
5. [Create Account](#create-account)
   - [Email Signup](#email-signup)
   - [Mobile Signup](#mobile-signup)
6. [Email Verification](#email-verification)
7. [OTP Verification](#otp-verification)
8. [Forgot Password](#forgot-password)
9. [Social Login](#social-login)
10. [Session Management](#session-management)
11. [Supabase Architecture](#supabase-architecture)
12. [Database Schema](#database-schema)
13. [API Contracts](#api-contracts)
14. [Component Tree](#component-tree)
15. [Validation Rules](#validation-rules)
16. [Error States](#error-states)
17. [Loading States](#loading-states)
18. [Success States](#success-states)
19. [Responsive Behaviour](#responsive-behaviour)
20. [Security](#security)
21. [QA Checklist](#qa-checklist)
22. [Deployment Checklist](#deployment-checklist)

## Product Goals
- Premium fintech authentication experience
- Supabase Auth as single authentication provider
- Email, Phone, Google, GitHub and Apple authentication
- Responsive on Desktop, Tablet and Mobile
- No placeholder functionality

## User Journeys
- **New User:** Landing → Create Account → Verification → Onboarding → Dashboard
- **Returning User:** Landing → Sign In → Dashboard

## Architecture
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL

## Notes
- This document is the master reference.
- Each section should later be expanded into detailed engineering specifications before implementation.
- **Development rule:** Read this document and implement ONE section at a time.
