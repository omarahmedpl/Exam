# Job Offer App

## Overview
The **Job Offer App** is a comprehensive platform that allows users to search for jobs relevant to their domain or area of interest. It enables job seekers to find opportunities, apply for jobs, and communicate with recruiters. Companies can post job openings, manage applications, and interact with candidates efficiently. 

## Features

### **For Job Seekers:**
- Search for jobs based on various filters like location, working time, and seniority level.
- Apply to jobs and upload CVs in PDF format.
- Track the status of job applications (Pending, Accepted, Rejected, etc.).
- Receive real-time notifications for job application updates.
- Engage in chat conversations with HR representatives.

### **For Companies & Recruiters:**
- Post job listings and manage applications.
- Filter and review candidate applications.
- Communicate with candidates via real-time chat.
- Approve or reject applications and notify applicants via email.
- Soft delete and ban/unban user accounts or companies (Admin only).

### **Security & Performance Enhancements:**
- **Authentication & Authorization:** Secure login with JWT tokens (access and refresh tokens).
- **Rate Limiting:** Prevents API abuse and protects against DDoS attacks.
- **Helmet Integration:** Enhances security by setting proper HTTP headers.
- **CORS Handling:** Enables secure cross-origin requests.
- **Global Error Handling:** Ensures a consistent response structure for error messages.
- **Data Validation:** Uses JOI to validate incoming data for APIs.

## **Tech Stack**
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, Google OAuth
- **Security:** Helmet, Rate Limiting, CORS
- **Real-time Communication:** Socket.IO
- **Task Scheduling:** Node-Cron (for automated cleanup of expired OTPs)
- **File Storage:** Cloudinary (for profile pictures, company logos, job-related documents)
- **GraphQL:** Used for admin dashboard queries

## **API Endpoints**

### **Authentication**
- `POST /auth/signup` - User registration with OTP verification
- `POST /auth/confirmOTP` - Confirm OTP for email verification
- `POST /auth/login` - User login with JWT tokens
- `POST /auth/forget-password` - Request OTP for password reset
- `POST /auth/reset-password` - Reset password using OTP
- `POST /auth/refresh-token` - Generate a new access token

### **Users**
- `PUT /user/` - Update user details (first name, last name, mobile, DOB, etc.)
- `GET /user/` - Retrieve logged-in user details
- `GET /user/:userId` - Get profile data for another user
- `PUT /user/update-password` - Change user password
- `DELETE /user/delete-account` - Soft delete user account
- `PUT /user/profile-pic` - Upload profile picture
- `DELETE /user/profile-pic` - Delete profile picture
- `PUT /user/cover-pic` - Upload cover picture
- `DELETE /user/cover-pic` - Delete cover picture

### **Companies**
- `POST /company` - Create a new company profile
- `PUT /company/:companyId` - Update company details
- `DELETE /company/:companyId` - Soft delete a company
- `GET /company?companyName=Tech Inc.` - Search company by name
- `GET /company/:companyId/related-jobs` - Get jobs related to a company
- `PUT /company/:companyId/logo` - Upload company logo
- `DELETE /company/:companyId/logo` - Delete company logo
- `PUT /company/:companyId/cover-pic` - Upload company cover picture
- `DELETE /company/:companyId/cover-pic` - Delete company cover picture

### **Jobs**
- `POST /job` - Create a new job posting
- `GET /job?companyName=Tech Inc.` - Get all jobs for a company
- `GET /job/:jobId` - Get a specific job
- `PUT /job/:jobId` - Update job details
- `DELETE /job/:jobId` - Delete a job posting
- `GET /job/:jobId/application/` - Retrieve all applications for a job
- `POST /job/:jobId/application/` - Apply to a job
- `PUT /job/:jobId/application/:applicationId` - Accept or reject an applicant
- `GET /job/application/:companyId/excel-sheet?createdAt=YYYY-MM-DD` - Get all company applications as an Excel sheet

### **Chat**
- `GET /chat/:userId` - Retrieve chat history with a user
- **Real-time Messaging:** HR representatives can initiate conversations with users via WebSockets.

## **Deployment**
This application is deployed on **AWS** for scalability and reliability.

## **Installation & Setup**
1. Clone the repository:
   ```bash
   git clone https://github.com/omarahmedpl/Exam.git
   cd Exam
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file and configure environment variables (e.g., JWT secret, MongoDB URI, Cloudinary credentials).
4. Start the application:
   ```bash
   pnpm run start:dev
   ```

## **Postman Collection**
- Ensure you **export your Postman collection** and include it in the repository.

## **Contributing**
Contributions are welcome! Feel free to submit a pull request or open an issue for any suggestions or improvements.

## **License**
This project is licensed under the MIT License.

---
**Job Offer App - Helping job seekers and recruiters connect efficiently!** 🚀

