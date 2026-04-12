export interface AttendanceRecord {
  id: number;
  member_id: number;
  check_in_time: string;
  check_out_time: string | null;
  attendance_date: string;
  member_name: string;
}

export interface CheckInRequest {
  memberId: number;
}
