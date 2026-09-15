# Especificación de Seguridad de Firebase — Academia Musical Judá (FASE 04)

Esta especificación formal define las invariantes de datos, el modelo de control de acceso basado en atributos y roles (RBAC / ABAC), los 12 vectores de ataque ("Dirty Dozen") y el archivo de pruebas unitarias para garantizar una arquitectura Zero-Trust donde la seguridad no dependa del frontend ni del cliente.

---

## 1. Invariantes del Sistema (Data Invariants)

1. **Invariante de Roles y Privilegios (Zero-Trust RBAC):**
   - La asignación de roles (`superadmin`, `admin`, `teacher`, `student`) reside exclusivamente en documentos autorizados (`/admins/{uid}` y `/teachers/{uid}`).
   - Ningún usuario común puede autoasignarse rol de `admin`, `superadmin` o `teacher`, ni modificar el campo `role` o `status` en `/users/{uid}`.
   - El director fundador (`mariobarillas24@gmail.com`) actúa como identidad raíz de bootstrap.

2. **Invariante de Cursos y Modalidades:**
   - La creación y modificación de cursos está reservada a administradores o al profesor titular asignado (`course.teacherId == auth.uid`).
   - Los alumnos solo pueden consultar cursos públicos o cursos en los cuales estén activamente matriculados.

3. **Invariante de Matrículas (`enrollments`):**
   - Un alumno NO puede crear o auto-aprobar su propia matrícula con estado `active` sin pasar por el flujo administrativo/financiero.
   - El alumno solo puede leer su propio registro de matrícula (`studentId == auth.uid`).
   - El alumno tiene estrictamente prohibido alterar las fechas de vigencia o el estado de la matrícula.

4. **Invariante de Pagos y Mensualidades (`payments`):**
   - Ningún alumno puede marcar su propio pago como `paid` ni alterar el monto (`amount`), divisa o número de comprobante.
   - Solo administradores pueden validar, registrar y conciliar pagos.
   - El alumno solo tiene acceso de lectura a sus propios recibos y mensualidades.

5. **Invariante de Progreso Académico (`progress`):**
   - El progreso y calificaciones son inmutables por parte del alumno.
   - Solo el profesor titular asignado al curso o un administrador pueden asentar evaluaciones, notas y lecciones completadas.

6. **Invariante de Asistencia (`attendance`):**
   - El registro de asistencia presencial o virtual en vivo solo puede ser creado/modificado por el profesor titular del curso o un administrador.
   - Un alumno jamás puede auto-marcarse presente ni alterar el historial de asistencias de otros alumnos.

7. **Invariante de Materiales, Partituras y PDFs (`materials`):**
   - Las partituras, PDFs y ejercicios solo son accesibles por alumnos matriculados en dicho curso o por los profesores del área y administradores.
   - La publicación, edición o eliminación de materiales está restringida a docentes asignados o administradores.

8. **Invariante de Certificados y Diplomas (`certificates`):**
   - Los certificados oficiales con hash criptográfico solo pueden ser emitidos por administradores o superadministradores.
   - Un alumno no puede forjar ni alterar calificaciones ni fecha de emisión de certificados.

9. **Invariante de Enlaces e Integraciones de Google Workspace (Meet, Drive, Classroom):**
   - Los códigos y URLs de Google Meet, IDs de carpetas en Google Drive y códigos de Google Classroom pertenecen a la entidad académica.
   - Ningún alumno puede alterar enlaces de Google Meet para redirigir a otra reunión, ni manipular referencias a carpetas privadas de Drive o aulas de Classroom.
   - Los enlaces de Meet solo son visibles para alumnos con matrícula activa en ese curso o docentes autorizados.

10. **Invariante de Trazabilidad e Inmutabilidad de Auditoría (`audit_logs`):**
    - Los registros de auditoría (`audit_logs`) son de solo escritura (append-only) y nunca pueden ser actualizados o eliminados por ningún usuario, preservando la cadena de custodia forense.

11. **Invariante de IDs y Sanitización de Carga:**
    - Todo ID en la ruta o clave foránea debe cumplir con el patrón seguro `^[a-zA-Z0-9_\-]+$` y longitud máxima de 128 caracteres.
    - Cargas con campos fantasma ("ghost fields") son rechazadas estrictamente mediante validación de claves permitidas.

---

## 2. Los Doce Payloads del "Dirty Dozen" (Vectores de Ataque)

| # | Vector de Ataque | Colección Objetivo | Intento Malicioso | Resultado Esperado |
|---|---|---|---|---|
| 1 | **Privilege Escalation** | `/users/student_123` | Alumno intenta actualizar su perfil enviando `{ role: 'admin' }` | **PERMISSION_DENIED** |
| 2 | **Direct Document Snooping** | `/users/student_999` | Alumno intenta hacer `get()` o `list()` sobre datos privados de otro alumno | **PERMISSION_DENIED** |
| 3 | **Payment Status Tampering** | `/payments/pay_789` | Alumno intenta crear o actualizar un pago con `{ status: 'paid', amount: 0.01 }` | **PERMISSION_DENIED** |
| 4 | **Self-Enrollment Bypass** | `/enrollments/enr_456` | Alumno intenta crear una matrícula con `{ status: 'active' }` sin autorización | **PERMISSION_DENIED** |
| 5 | **Google Meet Link Hijack** | `/courses/piano_101` | Alumno intenta modificar `meetUrl` de una clase por su propio enlace externo | **PERMISSION_DENIED** |
| 6 | **Google Drive Material Injection** | `/materials/mat_1` | Alumno intenta publicar un archivo en Drive en nombre del profesor | **PERMISSION_DENIED** |
| 7 | **Self-Grading Grade Spoof** | `/progress/prog_bach` | Alumno intenta actualizar su registro de progreso para ponerse nota 100/100 | **PERMISSION_DENIED** |
| 8 | **Attendance Fabrication** | `/attendance/att_session1` | Alumno intenta registrar su propia asistencia en una clase presencial/virtual | **PERMISSION_DENIED** |
| 9 | **Fake Certificate Forgery** | `/certificates/cert_diploma` | Alumno intenta crear un certificado oficial de graduación | **PERMISSION_DENIED** |
| 10 | **ID Poisoning / Injection** | `/users/../../../root` | Atacante envía un ID con caracteres de path traversal o carga masiva (>128 chars) | **PERMISSION_DENIED** |
| 11 | **Shadow Update / Ghost Field** | `/users/student_123` | Alumno envía campos válidos pero adjunta un campo oculto `isSuperUser: true` | **PERMISSION_DENIED** |
| 12 | **Audit Log Tampering / Deletion** | `/audit_logs/log_999` | Usuario o atacante intenta eliminar o modificar una traza de auditoría | **PERMISSION_DENIED** |

---

## 3. Matriz de Control de Acceso por Colección

| Colección | Alumno (Student) | Profesor (Teacher) | Administrador | Superadministrador |
|---|---|---|---|---|
| `/users/{id}` | Read (Propio) / Update (Campos limitados) | Read (Alumnos asignados) | Read Todos / Update | Control Total |
| `/admins/{id}` | Read Denegado | Read Denegado | Read / Verify | Control Total |
| `/teachers/{id}` | Read Solo si activo | Read Todos | Read / Create / Update | Control Total |
| `/courses/{id}` | Read (Públicos / Matriculados) | Read Todos / Update si es titular | CRUD Total | Control Total |
| `/enrollments/{id}` | Read (Solo propias) | Read (Alumnos de sus cursos) | CRUD Total | Control Total |
| `/payments/{id}` | Read (Solo propios) | Denegado | CRUD Total | Control Total |
| `/progress/{id}` | Read (Solo propio) | Read & Write (Cursos asignados) | CRUD Total | Control Total |
| `/attendance/{id}` | Read (Solo propio) | Read & Write (Cursos asignados) | CRUD Total | Control Total |
| `/materials/{id}` | Read (Si está matriculado) | Read & Write (Cursos asignados) | CRUD Total | Control Total |
| `/certificates/{id}` | Read (Solo propios) | Read (Cursos asignados) | Read & Issue (Crear) | Control Total |
| `/google_integrations/{id}` | Read (Solo referencias de cursos matriculados) | Read & Write (Cursos asignados) | CRUD Total | Control Total |
| `/audit_logs/{id}` | Denegado | Denegado | Read / Create (Append) | Read / Create (Append) |
