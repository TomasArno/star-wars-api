# Star Wars API

## 1. **Instalar Dependencias**

Instala todas las dependencias del proyecto ejecutando el siguiente comando:

```bash
npm install
```

## 2. **Configurar Variables de Entorno**

La aplicación carga las variables de entorno desde archivos `.env`. Asegúrate de crear un archivo `.env.dev` para el entorno de desarrollo:

Ejemplo de `.env.dev`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=usuario
DB_PASSWORD=contraseña
DB_NAME=star_wars_db
JWT_SECRET=mysecretkey
```

Para otros entornos, puedes crear archivos `.env.prod`, `.env.test`, etc.

## 3. **Base de Datos**

La aplicación utiliza **PostgreSQL** como base de datos. Asegúrate de tener un servidor PostgreSQL en ejecución y que las credenciales configuradas en el archivo `.env.*`

## 4. **Ejecutar la Aplicación**

### **Modo Desarrollo**

Para ejecutar la aplicación en modo desarrollo con recarga automática:

```bash
npm run start:dev
```

Esto iniciará el servidor en el puerto 3000 (o el que hayas definido en el archivo `.env`).

## 5. **Acceder a la API**

Una vez que la aplicación esté corriendo, puedes acceder a la documentación Swagger en:

```bash
http://localhost:3000/api
```

Aquí podrás ver y probar los endpoints de la API.

## 6. **Ejecutar Pruebas**

Para ejecutar pruebas unitarias:

```bash
npm run test
```
