-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "telefono" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'turista',
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreEs" TEXT NOT NULL,
    "nombreEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icono" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Negocio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcionEs" TEXT,
    "descripcionEn" TEXT,
    "direccion" TEXT,
    "distrito" TEXT,
    "lat" REAL,
    "lng" REAL,
    "whatsapp" TEXT,
    "telefono" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "horario" TEXT,
    "rangoPrecio" INTEGER NOT NULL DEFAULT 1,
    "aceptaYape" BOOLEAN NOT NULL DEFAULT false,
    "aceptaTarjeta" BOOLEAN NOT NULL DEFAULT false,
    "idiomasAtencion" TEXT,
    "aceptaReservas" BOOLEAN NOT NULL DEFAULT true,
    "capacidadMax" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "ruc" TEXT,
    "ratingPromedio" REAL NOT NULL DEFAULT 0,
    "totalResenas" INTEGER NOT NULL DEFAULT 0,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Negocio_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Negocio_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FotoNegocio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "negocioId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esPortada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FotoNegocio_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "negocioId" TEXT NOT NULL,
    "nombreEs" TEXT NOT NULL,
    "nombreEn" TEXT,
    "descripcion" TEXT,
    "precio" REAL NOT NULL,
    "duracionMin" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Servicio_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tituloEs" TEXT NOT NULL,
    "tituloEn" TEXT,
    "slug" TEXT NOT NULL,
    "descripcionEs" TEXT,
    "descripcionEn" TEXT,
    "portadaUrl" TEXT,
    "duracionEstimada" TEXT,
    "dificultad" TEXT,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RutaParada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rutaId" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "notaEs" TEXT,
    "notaEn" TEXT,
    CONSTRAINT "RutaParada_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RutaParada_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "servicioId" TEXT,
    "turistaId" TEXT,
    "nombreContacto" TEXT NOT NULL,
    "emailContacto" TEXT NOT NULL,
    "whatsappContacto" TEXT,
    "pais" TEXT,
    "fecha" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "personas" INTEGER NOT NULL DEFAULT 1,
    "comentario" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "canalOrigen" TEXT NOT NULL DEFAULT 'web',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reserva_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reserva_turistaId_fkey" FOREIGN KEY ("turistaId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resena" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservaId" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "autorNombre" TEXT NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "comentario" TEXT,
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "respuestaNegocio" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'visible',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resena_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resena_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "negocioId" TEXT,
    "rutaId" TEXT,
    "etiqueta" TEXT,
    "slugCorto" TEXT NOT NULL,
    "escaneos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QrCode_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QrCode_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "negocioId" TEXT,
    "rutaId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evento_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reclamo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "domicilio" TEXT,
    "detalle" TEXT NOT NULL,
    "pedido" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "respuesta" TEXT,
    "fechaRespuesta" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Negocio_slug_key" ON "Negocio"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ruta_slug_key" ON "Ruta"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_codigo_key" ON "Reserva"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Resena_reservaId_key" ON "Resena"("reservaId");

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_slugCorto_key" ON "QrCode"("slugCorto");

-- CreateIndex
CREATE UNIQUE INDEX "Reclamo_codigo_key" ON "Reclamo"("codigo");
