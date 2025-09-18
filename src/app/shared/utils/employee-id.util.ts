export class EmployeeIdUtil {
  static toUserId(employeeId: any, employees?: any[]): number | null {
    if (employeeId === undefined || employeeId === null) return null;
    
    const numericId = typeof employeeId === 'number' ? employeeId : parseInt(employeeId);
    if (isNaN(numericId)) return null;
    
    // If no employees array provided, just return the numeric ID
    if (!employees) return numericId;
    
    // Validate that the employee exists
    const employee = employees.find(emp => emp.id === numericId);
    return employee ? numericId : null;
  }
}

export function convertEmployeeId(employeeId: any, employees?: any[]): number | null {
  return EmployeeIdUtil.toUserId(employeeId, employees);
}