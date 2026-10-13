import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface EmployeeDto {
  id: number;
  documentNumber: string;
  fullName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  enterpriseId?: number;
}

export interface CreateEmployeeDto {
  documentNumber: string;
  fullName: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateEmployeeDto {
  fullName: string;
  phone?: string;
  role?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5235/api/employees';

  /**
   * Obtiene todos los empleados dados de alta por la empresa autenticada.
   */
  getEmployees(): Observable<EmployeeDto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((list: any[]) => {
        if (!Array.isArray(list)) return [];
        return list.map((item) => ({
          id: item.id || item.Id || 0,
          documentNumber: item.documentNumber || item.DocumentNumber || '',
          fullName: item.fullName || item.FullName || item.name || item.Name || 'Sin nombre',
          phone: item.phone || item.Phone || '',
          role: item.role || item.Role || 'Colaborador',
          isActive: item.isActive ?? item.IsActive ?? true,
          createdAt: item.createdAt || item.CreatedAt,
          enterpriseId: item.enterpriseId || item.EnterpriseId
        }));
      })
    );
  }

  /**
   * Obtiene un empleado por su ID numérico.
   */
  getEmployeeById(id: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca y obtiene un empleado por su número de cédula / documento de identidad mediante GET.
   * Normaliza las propiedades de la respuesta (PascalCase / camelCase) para garantizar su renderizado en la plantilla.
   */
  getEmployeeByDocument(documentNumber: string): Observable<EmployeeDto> {
    const cleanDoc = documentNumber.trim();
    const encodedDoc = encodeURIComponent(cleanDoc);

    return this.http.get<any>(`${this.apiUrl}/document/${encodedDoc}`).pipe(
      map((res: any) => {
        const item = Array.isArray(res) ? res[0] : res;
        if (!item) throw new Error('Empleado no encontrado.');
        return {
          id: item.id || item.Id || 0,
          documentNumber: item.documentNumber || item.DocumentNumber || cleanDoc,
          fullName: item.fullName || item.FullName || item.name || item.Name || 'Sin nombre',
          phone: item.phone || item.Phone || '',
          role: item.role || item.Role || 'Colaborador',
          isActive: item.isActive ?? item.IsActive ?? true,
          createdAt: item.createdAt || item.CreatedAt,
          enterpriseId: item.enterpriseId || item.EnterpriseId
        } as EmployeeDto;
      }),
      catchError((error) => {
        const digitsOnly = cleanDoc.replace(/\D/g, '');
        if (digitsOnly && digitsOnly !== cleanDoc) {
          return this.http.get<any>(`${this.apiUrl}/document/${encodeURIComponent(digitsOnly)}`).pipe(
            map((res: any) => {
              const item = Array.isArray(res) ? res[0] : res;
              if (!item) throw new Error('Empleado no encontrado.');
              return {
                id: item.id || item.Id || 0,
                documentNumber: item.documentNumber || item.DocumentNumber || digitsOnly,
                fullName: item.fullName || item.FullName || item.name || item.Name || 'Sin nombre',
                phone: item.phone || item.Phone || '',
                role: item.role || item.Role || 'Colaborador',
                isActive: item.isActive ?? item.IsActive ?? true,
                createdAt: item.createdAt || item.CreatedAt,
                enterpriseId: item.enterpriseId || item.EnterpriseId
              } as EmployeeDto;
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo empleado en la base de datos mediante POST.
   */
  createEmployee(employee: CreateEmployeeDto): Observable<EmployeeDto> {
    return this.http.post<any>(this.apiUrl, employee).pipe(
      map((item: any) => ({
        id: item.id || item.Id || 0,
        documentNumber: item.documentNumber || item.DocumentNumber || employee.documentNumber,
        fullName: item.fullName || item.FullName || employee.fullName,
        phone: item.phone || item.Phone || employee.phone || '',
        role: item.role || item.Role || employee.role || 'Colaborador',
        isActive: item.isActive ?? item.IsActive ?? true,
        createdAt: item.createdAt || item.CreatedAt,
        enterpriseId: item.enterpriseId || item.EnterpriseId
      } as EmployeeDto))
    );
  }

  /**
   * Actualiza los datos de un empleado existente mediante PUT.
   */
  updateEmployee(id: number, employee: UpdateEmployeeDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, employee);
  }

  /**
   * Elimina un empleado mediante DELETE.
   */
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
