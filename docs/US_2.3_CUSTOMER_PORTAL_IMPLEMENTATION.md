# US 2.3 - Customer Portal Implementation

## Overview

This document outlines the implementation of the Customer Portal feature for the Service Booking demo application. The portal allows customers to track their service requests, view appointment details, see activity timelines, and manage attachments.

## Features Implemented

### 1. Customer Dashboard (`/demos/service-booking/customer`)

**File:** `customer-dashboard.ts`, `customer-dashboard.html`, `customer-dashboard.css`

**Features:**
- Grid/card layout displaying all customer requests
- Status badges with color coding:
  - Submitted (blue)
  - In Review (orange)
  - Scheduled (purple)
  - Quoted (green)
  - Closed (gray)
- Filter by status dropdown
- Search by Request ID
- Appointment preview (date/time or "No appointment")
- Quick actions:
  - "View Details" button (links to detail page)
  - "Schedule Appointment" button (if no appointment exists)
- Empty state with "Create a New Request" CTA
- Automatic backfilling of activity events for existing requests

### 2. Request Detail Page (`/demos/service-booking/customer/requests/:id`)

**File:** `customer-request-detail.ts`, `customer-request-detail.html`, `customer-request-detail.css`

**Features:**

#### Summary Section
- Request ID and status badge
- Service type
- Created date
- Current status
- Appointment details (or "Not scheduled")
- Customer name
- "Schedule Appointment" CTA (if applicable)

#### Activity Timeline
- Chronological list of all events (oldest first)
- Event types with color-coded markers:
  - Created (blue)
  - Status change (orange)
  - Appointment booked/rescheduled (purple)
  - Appointment canceled (red)
  - Quote created (green)
  - Attachment added (teal)
  - Note (gray)
- Formatted timestamps
- Visual timeline connector between events

#### Attachments Section
- Mock file upload UI (stores metadata only)
- File size validation (max 5MB)
- List of uploaded attachments with:
  - File name
  - File size (KB/MB)
  - Upload date
  - Remove button
- Empty state message

#### Demo Controls (Toggle-able)
- Status change simulator dropdown
- "Simulate Quote Sent" button
- Yellow warning banner indicating demo-only features

### 3. Data Models

#### ActivityEvent (`activity-log.model.ts`)
```typescript
interface ActivityEvent {
  id: string;
  requestId: string;
  type: ActivityEventType;
  message: string;
  timestamp: string; // ISO format
  metadata?: {
    fromStatus?: string;
    toStatus?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    fileName?: string;
  };
}
```

**Event Types:**
- `created`
- `status-change`
- `appointment-booked`
- `appointment-rescheduled`
- `appointment-canceled`
- `quote-created`
- `note`
- `attachment-added`

#### Attachment (`attachment.model.ts`)
```typescript
interface Attachment {
  id: string;
  requestId: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string; // ISO format
  note?: string;
}
```

### 4. Services

#### RequestRepositoryService (`request-repository.service.ts`)
- `getAllRequests()`: Get all requests sorted by date (newest first)
- `getRequestById(id)`: Get single request
- `updateRequestStatus(id, status)`: Update status and updatedAt timestamp
- `saveRequest(request)`: Save or update a request
- `attachAppointment(requestId, appointment)`: Link appointment and set status to Scheduled
- `detachAppointment(requestId)`: Remove appointment and revert status to In Review

#### ActivityLogService (`activity-log.service.ts`)
- `getEventsForRequest(requestId)`: Get all events sorted chronologically
- `appendEvent(event)`: Add new event
- `logCreated(requestId, timestamp?)`: Log request creation
- `logStatusChange(requestId, from, to)`: Log status change
- `logAppointmentBooked(requestId, date, time)`: Log appointment booking
- `logAppointmentRescheduled(requestId, oldDate, oldTime, newDate, newTime)`: Log reschedule
- `logAppointmentCanceled(requestId)`: Log cancellation
- `logAttachmentAdded(requestId, fileName)`: Log attachment upload
- `logQuoteCreated(requestId)`: Log quote sent
- `logNote(requestId, note)`: Log custom note
- `backfillMissingEvents(requests)`: Create "created" events for requests without any

#### AttachmentService (`attachment.service.ts`)
- `getAttachments(requestId)`: Get all attachments sorted by upload date
- `addAttachment(requestId, fileMeta)`: Add new attachment metadata
- `removeAttachment(requestId, attachmentId)`: Delete attachment
- `getAttachmentCount(requestId)`: Get total count

### 5. Integration with Existing Flows

#### QuoteRequestService Updates
- Integrated `ActivityLogService` injection
- Added `tap` operator to log "created" event when request is successfully created
- Maintains existing functionality while adding activity tracking

#### AppointmentService Updates
- Integrated `ActivityLogService` and `RequestRepositoryService` injections
- `saveAppointment()`:
  - Detects new booking vs. reschedule
  - Calls `attachAppointment()` to update request status to "Scheduled"
  - Logs appropriate activity event (booked or rescheduled)
- `cancelAppointment()`:
  - Calls `detachAppointment()` to revert request status
  - Logs cancellation event
- `rescheduleAppointment()`:
  - Updates appointment details
  - Calls `attachAppointment()` with new data
  - Logs rescheduled event with old and new times

### 6. Status Lifecycle

**Status Flow:**
1. `Submitted` - Initial state when request is created
2. `In Review` - (Manual change or after appointment canceled)
3. `Scheduled` - Automatically set when appointment is booked
4. `Quoted` - Set when quote is sent to customer
5. `Closed` - Final state

**Automatic Status Updates:**
- Request → Scheduled: When appointment is booked (if status is Submitted or In Review)
- Request → In Review: When appointment is canceled (if status was Scheduled)

### 7. Routes Added

```typescript
{ path: 'demos/service-booking/customer', component: CustomerDashboard }
{ path: 'demos/service-booking/customer/requests/:id', component: CustomerRequestDetail }
```

### 8. LocalStorage Keys

- `kcws_quote_requests` - Quote requests (shared with existing flow)
- `kcws_booking_appointments_v1` - Appointments (shared with existing flow)
- `kcws_booking_activity_v1` - Activity events (new)
- `kcws_booking_attachments_v1` - Attachment metadata (new)

## Testing

### Manual Testing Guide

1. **Create Request Flow:**
   - Go to `/demos/service-booking/request-quote`
   - Fill out form and submit
   - Verify "created" activity event is logged
   - Navigate to `/demos/service-booking/customer`
   - Verify request appears with "Submitted" status

2. **Appointment Booking:**
   - Click "View Details" on a request
   - Click "Schedule Appointment"
   - Book an appointment
   - Verify status changes to "Scheduled"
   - Verify activity event "Appointment booked for..." appears
   - Verify appointment shows in summary section

3. **Appointment Rescheduling:**
   - From appointment summary, click "Reschedule"
   - Select new date/time
   - Verify "Appointment rescheduled from..." event appears
   - Verify request still shows "Scheduled" status

4. **Appointment Cancellation:**
   - From appointment summary, click "Cancel"
   - Verify "Appointment canceled" event appears
   - Verify status reverts to "In Review"
   - Verify appointment section shows "Not scheduled"

5. **Attachment Upload:**
   - On request detail page, click "Upload Photo or Attachment"
   - Select a file (max 5MB)
   - Verify attachment appears in list with name, size, date
   - Verify activity event "Attachment added: ..." appears
   - Click remove button to test deletion

6. **Status Simulation (Demo Controls):**
   - Click "Show Demo Controls"
   - Change status via dropdown
   - Verify activity event logged
   - Click "Simulate Quote Sent"
   - Verify status changes to "Quoted" and event logged

7. **Filters and Search:**
   - Test status filter dropdown
   - Test search by Request ID
   - Verify filtering works correctly

### Verification Tool

A verification tool has been created at `tools/verify_customer_portal.html` that allows you to:
- Create sample requests with/without appointments
- View all localStorage data
- Clear all data
- Quick links to customer dashboard and request form

Open the file in a browser (while dev server is running) to use the tool.

## File Structure

```
src/app/
├── models/
│   └── quote-request.ts (updated: added updatedAt field)
├── pages/demos/service-booking/
│   ├── activity-log.model.ts (new)
│   ├── activity-log.service.ts (new)
│   ├── attachment.model.ts (new)
│   ├── attachment.service.ts (new)
│   ├── request-repository.service.ts (new)
│   ├── customer-dashboard.ts (new)
│   ├── customer-dashboard.html (new)
│   ├── customer-dashboard.css (new)
│   ├── customer-request-detail.ts (new)
│   ├── customer-request-detail.html (new)
│   ├── customer-request-detail.css (new)
│   ├── appointment.service.ts (updated: integrated activity logging)
│   └── [existing files...]
├── services/
│   └── quote-request.service.ts (updated: integrated activity logging)
└── app.routes.ts (updated: added customer portal routes)
```

## Build Status

✅ **Build Successful**
- No TypeScript errors
- No compilation errors
- One CSS budget warning (customer-request-detail.css: 5.28 kB vs 4 kB budget)

## Definition of Done

✅ Customer dashboard renders and lists stored requests
✅ Detail view works by route param and shows timeline
✅ Status badges show correct text and colors
✅ Scheduling integration visible from detail view
✅ Optional attachments mock works and persists
✅ No console errors
✅ Builds successfully
✅ All existing tests still pass
✅ Activity logging integrated into existing flows
✅ Data persists across refresh (localStorage)

## Known Limitations

1. **No Authentication**: Assumes single mock customer - all requests visible to everyone
2. **Mock File Upload**: Only metadata stored, not actual files
3. **No Pagination**: Dashboard shows all requests (could be slow with hundreds of requests)
4. **CSS Budget Warning**: customer-request-detail.css slightly exceeds 4 kB budget (5.28 kB)

## Future Enhancements (Out of Scope)

- Multi-customer authentication
- Real file upload with backend storage
- Pagination/infinite scroll for dashboard
- Email notifications for status changes
- Real-time updates (WebSockets)
- Export request history to PDF
- Customer preferences/settings
- Message center for customer-admin communication

## Notes

- All functionality is front-end only using localStorage
- Demo controls are intentionally visible to showcase lifecycle changes
- Status changes are automatic when appointments are booked/canceled
- Activity log is immutable (events are never deleted or modified)
- Attachment service validates file size but stores metadata only
