import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function reservaCodigo() {
  return "AQP-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

const horarioCompleto = JSON.stringify({
  lunes:    { abre: "08:00", cierra: "17:00", cerrado: false },
  martes:   { abre: "08:00", cierra: "17:00", cerrado: false },
  miercoles:{ abre: "08:00", cierra: "17:00", cerrado: false },
  jueves:   { abre: "08:00", cierra: "17:00", cerrado: false },
  viernes:  { abre: "08:00", cierra: "18:00", cerrado: false },
  sabado:   { abre: "09:00", cierra: "16:00", cerrado: false },
  domingo:  { abre: "09:00", cierra: "14:00", cerrado: false },
});

const horarioSinDomingo = JSON.stringify({
  lunes:    { abre: "09:00", cierra: "18:00", cerrado: false },
  martes:   { abre: "09:00", cierra: "18:00", cerrado: false },
  miercoles:{ abre: "09:00", cierra: "18:00", cerrado: false },
  jueves:   { abre: "09:00", cierra: "18:00", cerrado: false },
  viernes:  { abre: "09:00", cierra: "19:00", cerrado: false },
  sabado:   { abre: "10:00", cierra: "16:00", cerrado: false },
  domingo:  { abre: "00:00", cierra: "00:00", cerrado: true  },
});

const idiomasEs    = JSON.stringify(["es"]);
const idiomasEsEn  = JSON.stringify(["es", "en"]);

async function main() {
  console.log("🌱 Iniciando seed de RutaMisti...\n");

  // ─── USUARIOS ───────────────────────────────────────────────────────────────
  const passAdmin    = await bcrypt.hash("Admin123!",   12);
  const passNegocio  = await bcrypt.hash("Negocio123!", 12);
  const passTurista  = await bcrypt.hash("Turista123!", 12);

  const admin = await prisma.user.upsert({
    where:  { email: "admin@rutamisti.com" },
    update: {},
    create: { email: "admin@rutamisti.com", name: "Admin RutaMisti", password: passAdmin, rol: "admin" },
  });

  const neg1 = await prisma.user.upsert({
    where:  { email: "negocio1@test.com" },
    update: {},
    create: { email: "negocio1@test.com", name: "Carmen Quispe", password: passNegocio, rol: "negocio" },
  });
  const neg2 = await prisma.user.upsert({
    where:  { email: "negocio2@test.com" },
    update: {},
    create: { email: "negocio2@test.com", name: "Roberto Mamani", password: passNegocio, rol: "negocio" },
  });
  const neg3 = await prisma.user.upsert({
    where:  { email: "negocio3@test.com" },
    update: {},
    create: { email: "negocio3@test.com", name: "Luisa Flores", password: passNegocio, rol: "negocio" },
  });

  const tur1 = await prisma.user.upsert({
    where:  { email: "turista1@test.com" },
    update: {},
    create: { email: "turista1@test.com", name: "Ana García", password: passTurista, rol: "turista" },
  });
  const tur2 = await prisma.user.upsert({
    where:  { email: "turista2@test.com" },
    update: {},
    create: { email: "turista2@test.com", name: "John Smith", password: passTurista, rol: "turista", idioma: "en" },
  });

  console.log("✅ Usuarios: 1 admin, 3 negocios, 2 turistas");

  // ─── CATEGORÍAS ─────────────────────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.categoria.upsert({ where: { slug: "picanteria" }, update: {}, create: { nombreEs: "Picantería", nombreEn: "Traditional Restaurant", slug: "picanteria", icono: "🍲" } }),
    prisma.categoria.upsert({ where: { slug: "restaurante-tipico" }, update: {}, create: { nombreEs: "Restaurante típico", nombreEn: "Local Restaurant", slug: "restaurante-tipico", icono: "🍽️" } }),
    prisma.categoria.upsert({ where: { slug: "artesania" }, update: {}, create: { nombreEs: "Artesanía", nombreEn: "Crafts", slug: "artesania", icono: "🏺" } }),
    prisma.categoria.upsert({ where: { slug: "taller-de-cocina" }, update: {}, create: { nombreEs: "Taller de cocina", nombreEn: "Cooking Workshop", slug: "taller-de-cocina", icono: "👨‍🍳" } }),
    prisma.categoria.upsert({ where: { slug: "guia-local" }, update: {}, create: { nombreEs: "Guía local", nombreEn: "Local Guide", slug: "guia-local", icono: "🧭" } }),
    prisma.categoria.upsert({ where: { slug: "cafe-dulceria" }, update: {}, create: { nombreEs: "Café/Dulcería", nombreEn: "Café/Bakery", slug: "cafe-dulceria", icono: "☕" } }),
    prisma.categoria.upsert({ where: { slug: "experiencia-cultural" }, update: {}, create: { nombreEs: "Experiencia cultural", nombreEn: "Cultural Experience", slug: "experiencia-cultural", icono: "🎭" } }),
  ]);

  const [catPic, catRest, catArt, catTaller, catGuia, catCafe, catCultural] = cats;
  console.log("✅ Categorías: 7 creadas");

  // ─── NEGOCIOS ───────────────────────────────────────────────────────────────
  type NegocioData = {
    nombre: string; ownerId: string; categoriaId: string;
    distrito: string; lat: number; lng: number;
    descripcionEs: string; descripcionEn: string;
    whatsapp: string; rangoPrecio: number;
    aceptaYape: boolean; aceptaTarjeta: boolean;
    idiomasAtencion: string; horario: string;
    capacidadMax: number; estado: string;
    servicios: { nombreEs: string; nombreEn: string; precio: number; duracionMin?: number }[];
    fotos: string[];
  };

  const negociosData: NegocioData[] = [
    // ── Yanahuara (3) ──────────────────────────────────────────────────────
    {
      nombre: "Picantería Doña Flor",
      ownerId: neg1.id, categoriaId: catPic.id,
      distrito: "Yanahuara", lat: -16.3932, lng: -71.5578,
      descripcionEs: "La picantería más tradicional de Yanahuara. Tres generaciones de sazón arequipeña auténtica con insumos del mercado San Camilo.",
      descripcionEn: "The most traditional restaurant in Yanahuara. Three generations of authentic Arequipa cooking with fresh local ingredients.",
      whatsapp: "+51951234501", rangoPrecio: 2, aceptaYape: true, aceptaTarjeta: false,
      idiomasAtencion: idiomasEs, horario: horarioCompleto, capacidadMax: 4,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Rocoto relleno",    nombreEn: "Stuffed rocoto pepper", precio: 22, duracionMin: undefined },
        { nombreEs: "Chupe de camarones",nombreEn: "Shrimp chowder",        precio: 28, duracionMin: undefined },
        { nombreEs: "Adobo arequipeño",  nombreEn: "Arequipa-style adobo",  precio: 20, duracionMin: undefined },
      ],
      fotos: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"],
    },
    {
      nombre: "Café Colonial Arequipa",
      ownerId: neg2.id, categoriaId: catCafe.id,
      distrito: "Yanahuara", lat: -16.3938, lng: -71.5570,
      descripcionEs: "Café de especialidad en una casona colonial restaurada. Granos de la región de Chivay tostados en casa.",
      descripcionEn: "Specialty coffee in a restored colonial mansion. Beans from the Chivay region, roasted in-house.",
      whatsapp: "+51951234502", rangoPrecio: 2, aceptaYape: true, aceptaTarjeta: true,
      idiomasAtencion: idiomasEsEn, horario: horarioSinDomingo, capacidadMax: 6,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Café de especialidad", nombreEn: "Specialty coffee",    precio: 12, duracionMin: undefined },
        { nombreEs: "Pastel de queso local",nombreEn: "Local cheese cake",   precio: 15, duracionMin: undefined },
      ],
      fotos: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"],
    },
    {
      nombre: "Guías del Misti Tours",
      ownerId: neg3.id, categoriaId: catGuia.id,
      distrito: "Yanahuara", lat: -16.3940, lng: -71.5565,
      descripcionEs: "Tours guiados por el volcán Misti y el valle del Colca. Guías certificados con más de 10 años de experiencia.",
      descripcionEn: "Guided tours to Misti volcano and Colca valley. Certified guides with over 10 years of experience.",
      whatsapp: "+51951234503", rangoPrecio: 3, aceptaYape: true, aceptaTarjeta: true,
      idiomasAtencion: idiomasEsEn, horario: horarioCompleto, capacidadMax: 8,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Tour Volcán Misti (1 día)",       nombreEn: "Misti Volcano tour (1 day)",    precio: 120, duracionMin: 480 },
        { nombreEs: "Tour Valle del Colca (2 días)",   nombreEn: "Colca Valley tour (2 days)",   precio: 280, duracionMin: 960 },
        { nombreEs: "City tour Arequipa",              nombreEn: "Arequipa city tour",            precio: 60,  duracionMin: 180 },
      ],
      fotos: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"],
    },

    // ── Cercado (3) ────────────────────────────────────────────────────────
    {
      nombre: "Cerámica Andina Workshop",
      ownerId: neg1.id, categoriaId: catArt.id,
      distrito: "Cercado", lat: -16.3990, lng: -71.5365,
      descripcionEs: "Taller de cerámica tradicional andina. Aprende las técnicas milenarias de alfarería con arcilla local de Chiguata.",
      descripcionEn: "Traditional Andean ceramics workshop. Learn ancient pottery techniques with local clay from Chiguata.",
      whatsapp: "+51951234504", rangoPrecio: 2, aceptaYape: true, aceptaTarjeta: false,
      idiomasAtencion: idiomasEsEn, horario: horarioSinDomingo, capacidadMax: 10,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Clase introductoria de cerámica", nombreEn: "Intro ceramics class", precio: 45, duracionMin: 90  },
        { nombreEs: "Taller avanzado (4 sesiones)",    nombreEn: "Advanced workshop",    precio: 160, duracionMin: 240 },
      ],
      fotos: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"],
    },
    {
      nombre: "Restaurante El Tambo Real",
      ownerId: neg2.id, categoriaId: catRest.id,
      distrito: "Cercado", lat: -16.3985, lng: -71.5375,
      descripcionEs: "Cocina arequipeña contemporánea en el centro histórico. Platos tradicionales con presentación moderna.",
      descripcionEn: "Contemporary Arequipa cuisine in the historic center. Traditional dishes with modern presentation.",
      whatsapp: "+51951234505", rangoPrecio: 2, aceptaYape: true, aceptaTarjeta: true,
      idiomasAtencion: idiomasEsEn, horario: horarioCompleto, capacidadMax: 6,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Menú degustación (5 platos)", nombreEn: "Tasting menu (5 courses)", precio: 65, duracionMin: undefined },
        { nombreEs: "Almuerzo ejecutivo",           nombreEn: "Executive lunch",          precio: 30, duracionMin: undefined },
        { nombreEs: "Pisco sour premium",           nombreEn: "Premium pisco sour",       precio: 18, duracionMin: undefined },
      ],
      fotos: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"],
    },
    {
      nombre: "Taller de Tejidos Qori",
      ownerId: neg3.id, categoriaId: catArt.id,
      distrito: "Cercado", lat: -16.3995, lng: -71.5360,
      descripcionEs: "Taller de tejidos en telar con lana de alpaca. Artesanas locales enseñan técnicas ancestrales.",
      descripcionEn: "Loom weaving workshop with alpaca wool. Local artisans teach ancestral techniques.",
      whatsapp: "+51951234506", rangoPrecio: 1, aceptaYape: true, aceptaTarjeta: false,
      idiomasAtencion: idiomasEs, horario: horarioSinDomingo, capacidadMax: 8,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Clase de tejido (2h)",      nombreEn: "Weaving class (2h)",   precio: 35, duracionMin: 120 },
        { nombreEs: "Kit + clase principiante",  nombreEn: "Starter kit + class",  precio: 55, duracionMin: 90  },
      ],
      fotos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    },

    // ── Cayma (2) ──────────────────────────────────────────────────────────
    {
      nombre: "Escuela de Cocina Aromas del Sur",
      ownerId: neg1.id, categoriaId: catTaller.id,
      distrito: "Cayma", lat: -16.3775, lng: -71.5640,
      descripcionEs: "Aprende a preparar los platos más emblemáticos de Arequipa. Clases para turistas en español e inglés.",
      descripcionEn: "Learn to cook the most iconic dishes of Arequipa. Classes for tourists in Spanish and English.",
      whatsapp: "+51951234507", rangoPrecio: 3, aceptaYape: true, aceptaTarjeta: true,
      idiomasAtencion: idiomasEsEn, horario: horarioSinDomingo, capacidadMax: 12,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Clase: Rocoto relleno + postre", nombreEn: "Class: Stuffed rocoto + dessert", precio: 85, duracionMin: 180 },
        { nombreEs: "Clase: Cuy al horno",            nombreEn: "Class: Roasted guinea pig",       precio: 95, duracionMin: 180 },
        { nombreEs: "Tour mercado + clase (3h)",      nombreEn: "Market tour + class (3h)",        precio: 110, duracionMin: 240 },
      ],
      fotos: ["https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800"],
    },
    {
      nombre: "Artesanías Sillar Blanco",
      ownerId: neg2.id, categoriaId: catArt.id,
      distrito: "Cayma", lat: -16.3780, lng: -71.5630,
      descripcionEs: "Esculturas y souvenirs tallados en sillar, la piedra volcánica blanca símbolo de Arequipa.",
      descripcionEn: "Sculptures and souvenirs carved in sillar, the white volcanic stone that symbolizes Arequipa.",
      whatsapp: "+51951234508", rangoPrecio: 2, aceptaYape: true, aceptaTarjeta: false,
      idiomasAtencion: idiomasEsEn, horario: horarioCompleto, capacidadMax: 4,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Taller talla en sillar (1.5h)",  nombreEn: "Sillar carving workshop",  precio: 50, duracionMin: 90 },
        { nombreEs: "Souvenir personalizado",          nombreEn: "Custom souvenir",          precio: 40, duracionMin: undefined },
      ],
      fotos: ["https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800"],
    },

    // ── San Lázaro (2) ─────────────────────────────────────────────────────
    {
      nombre: "Rincón del Barranco",
      ownerId: neg3.id, categoriaId: catPic.id,
      distrito: "San Lázaro", lat: -16.3950, lng: -71.5308,
      descripcionEs: "Picantería familiar en el barrio más antiguo de Arequipa. Ambiente acogedor con vista al barranco del río Chili.",
      descripcionEn: "Family restaurant in Arequipa's oldest neighborhood. Cozy atmosphere with views of the Chili river ravine.",
      whatsapp: "+51951234509", rangoPrecio: 1, aceptaYape: true, aceptaTarjeta: false,
      idiomasAtencion: idiomasEs, horario: horarioCompleto, capacidadMax: 4,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Plato del día",    nombreEn: "Daily special",     precio: 15, duracionMin: undefined },
        { nombreEs: "Sopa seca",        nombreEn: "Seco soup",         precio: 18, duracionMin: undefined },
        { nombreEs: "Escribano",        nombreEn: "Escribano salad",   precio: 12, duracionMin: undefined },
      ],
      fotos: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"],
    },
    {
      nombre: "Galería de Arte Chili",
      ownerId: neg1.id, categoriaId: catCultural.id,
      distrito: "San Lázaro", lat: -16.3955, lng: -71.5302,
      descripcionEs: "Galería y taller de artistas locales. Exposiciones permanentes y visitas guiadas por el barrio bohemio de San Lázaro.",
      descripcionEn: "Gallery and studio of local artists. Permanent exhibitions and guided tours through the bohemian San Lázaro neighborhood.",
      whatsapp: "+51951234510", rangoPrecio: 1, aceptaYape: false, aceptaTarjeta: true,
      idiomasAtencion: idiomasEsEn, horario: horarioSinDomingo, capacidadMax: 15,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Visita guiada al barrio (1h)",   nombreEn: "Neighborhood guided tour (1h)", precio: 25, duracionMin: 60  },
        { nombreEs: "Clase de acuarela",              nombreEn: "Watercolor class",              precio: 55, duracionMin: 120 },
      ],
      fotos: ["https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800"],
    },

    // ── Sachaca (2) ────────────────────────────────────────────────────────
    {
      nombre: "Bodega El Viñedo del Sol",
      ownerId: neg2.id, categoriaId: catCultural.id,
      distrito: "Sachaca", lat: -16.4198, lng: -71.5702,
      descripcionEs: "Tour y degustación en la única bodega artesanal de Arequipa. Vinos y piscos elaborados con uvas de los valles del sur.",
      descripcionEn: "Tour and tasting at Arequipa's only craft winery. Wines and piscos made with grapes from southern valleys.",
      whatsapp: "+51951234511", rangoPrecio: 3, aceptaYape: false, aceptaTarjeta: true,
      idiomasAtencion: idiomasEsEn, horario: horarioSinDomingo, capacidadMax: 20,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Tour bodega + degustación (1.5h)", nombreEn: "Winery tour + tasting (1.5h)", precio: 75, duracionMin: 90  },
        { nombreEs: "Maridaje pisco y quesos",          nombreEn: "Pisco and cheese pairing",     precio: 55, duracionMin: 60  },
      ],
      fotos: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800"],
    },
    {
      nombre: "Dulcería Tradiciones Sachaca",
      ownerId: neg3.id, categoriaId: catCafe.id,
      distrito: "Sachaca", lat: -16.4204, lng: -71.5694,
      descripcionEs: "Dulcería tradicional con recetas de más de 100 años. Especialistas en queso helado, bienmesabe y chocolate arequipeño.",
      descripcionEn: "Traditional candy shop with 100-year-old recipes. Specialists in queso helado, bienmesabe and Arequipa chocolate.",
      whatsapp: "+51951234512", rangoPrecio: 1, aceptaYape: true, aceptaTarjeta: false,
      idiomasAtencion: idiomasEs, horario: horarioCompleto, capacidadMax: 6,
      estado: "aprobado",
      servicios: [
        { nombreEs: "Queso helado (sabores variados)",  nombreEn: "Queso helado ice cream",    precio: 8,  duracionMin: undefined },
        { nombreEs: "Caja surtida de dulces",           nombreEn: "Assorted sweets box",        precio: 35, duracionMin: undefined },
        { nombreEs: "Clase de chocolatería (2h)",       nombreEn: "Chocolate making class",     precio: 65, duracionMin: 120 },
      ],
      fotos: ["https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=800"],
    },

    // ── Pendientes (2) ─────────────────────────────────────────────────────
    {
      nombre: "Fusion Andina Bistró",
      ownerId: neg2.id, categoriaId: catRest.id,
      distrito: "Cercado", lat: -16.3983, lng: -71.5380,
      descripcionEs: "Cocina de fusión andina-mediterránea. Próximo a abrir en el centro histórico.",
      descripcionEn: "Andean-Mediterranean fusion cuisine. Coming soon to the historic center.",
      whatsapp: "+51951234513", rangoPrecio: 3, aceptaYape: true, aceptaTarjeta: true,
      idiomasAtencion: idiomasEsEn, horario: horarioSinDomingo, capacidadMax: 8,
      estado: "pendiente",
      servicios: [
        { nombreEs: "Menú fusión (4 tiempos)", nombreEn: "Fusion menu (4 courses)", precio: 90, duracionMin: undefined },
      ],
      fotos: ["https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800"],
    },
    {
      nombre: "Ruta a Pie por Yanahuara",
      ownerId: neg1.id, categoriaId: catGuia.id,
      distrito: "Yanahuara", lat: -16.3934, lng: -71.5580,
      descripcionEs: "Recorridos pedestres por los callejones históricos de Yanahuara. Pendiente de aprobación.",
      descripcionEn: "Walking tours through Yanahuara's historic alleys. Pending approval.",
      whatsapp: "+51951234514", rangoPrecio: 1, aceptaYape: true, aceptaTarjeta: false,
      idiomasAtencion: idiomasEsEn, horario: horarioSinDomingo, capacidadMax: 10,
      estado: "pendiente",
      servicios: [
        { nombreEs: "Tour a pie Yanahuara (2h)", nombreEn: "Yanahuara walking tour (2h)", precio: 30, duracionMin: 120 },
      ],
      fotos: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"],
    },
  ];

  const negociosCreados: { id: string; nombre: string; categoriaId: string }[] = [];

  for (const nd of negociosData) {
    const { servicios, fotos, ...data } = nd;
    const slug = slugify(data.nombre);

    const negocio = await prisma.negocio.upsert({
      where:  { slug },
      update: {},
      create: { ...data, slug },
    });

    // Fotos
    for (let i = 0; i < fotos.length; i++) {
      await prisma.fotoNegocio.upsert({
        where:  { id: `foto-${negocio.id}-${i}` },
        update: {},
        create: { id: `foto-${negocio.id}-${i}`, negocioId: negocio.id, url: fotos[i], orden: i, esPortada: i === 0 },
      });
    }

    // Servicios
    for (let i = 0; i < servicios.length; i++) {
      const s = servicios[i];
      await prisma.servicio.upsert({
        where:  { id: `srv-${negocio.id}-${i}` },
        update: {},
        create: { id: `srv-${negocio.id}-${i}`, negocioId: negocio.id, ...s, activo: true },
      });
    }

    negociosCreados.push({ id: negocio.id, nombre: negocio.nombre, categoriaId: negocio.categoriaId });
  }

  console.log(`✅ Negocios: ${negociosCreados.length} creados (12 aprobados, 2 pendientes)`);

  // ─── RUTAS TEMÁTICAS ────────────────────────────────────────────────────────
  const negPicanterias  = negociosCreados.filter(n => n.categoriaId === catPic.id || n.categoriaId === catRest.id).slice(0, 4);
  const negSillar       = negociosCreados.filter(n => n.categoriaId === catArt.id || n.categoriaId === catCultural.id).slice(0, 4);
  const negArtesanal    = negociosCreados.filter(n => n.categoriaId === catArt.id || n.categoriaId === catTaller.id).slice(0, 3);

  const rutas = await Promise.all([
    prisma.ruta.upsert({
      where:  { slug: "ruta-de-las-picanterias" },
      update: {},
      create: {
        tituloEs: "Ruta de las Picanterías", tituloEn: "Picantería Route",
        slug: "ruta-de-las-picanterias",
        descripcionEs: "Recorre las mejores picanterías y restaurantes típicos de Arequipa. Un viaje gastronómico por el sabor auténtico de la Ciudad Blanca.",
        descripcionEn: "Visit the best traditional restaurants in Arequipa. A gastronomic journey through the authentic flavors of the White City.",
        portadaUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
        duracionEstimada: "4-5 horas", dificultad: "fácil", publicada: true,
      },
    }),
    prisma.ruta.upsert({
      where:  { slug: "ruta-del-sillar" },
      update: {},
      create: {
        tituloEs: "Ruta del Sillar", tituloEn: "Sillar Stone Route",
        slug: "ruta-del-sillar",
        descripcionEs: "Descubre el arte de la talla en sillar, la piedra volcánica blanca que define la arquitectura de Arequipa. Visita talleres y galerías.",
        descripcionEn: "Discover the art of sillar stone carving, the white volcanic rock that defines Arequipa's architecture. Visit workshops and galleries.",
        portadaUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200",
        duracionEstimada: "3-4 horas", dificultad: "fácil", publicada: true,
      },
    }),
    prisma.ruta.upsert({
      where:  { slug: "arequipa-artesanal" },
      update: {},
      create: {
        tituloEs: "Arequipa Artesanal", tituloEn: "Artisan Arequipa",
        slug: "arequipa-artesanal",
        descripcionEs: "Conoce a los artesanos que mantienen vivas las tradiciones textiles y culinarias de Arequipa. Talleres prácticos incluidos.",
        descripcionEn: "Meet the artisans keeping Arequipa's textile and culinary traditions alive. Hands-on workshops included.",
        portadaUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200",
        duracionEstimada: "5-6 horas", dificultad: "moderada", publicada: true,
      },
    }),
  ]);

  const [rutaPic, rutaSillar, rutaArt] = rutas;

  // Paradas
  for (let i = 0; i < negPicanterias.length; i++) {
    await prisma.rutaParada.upsert({
      where:  { id: `parada-pic-${i}` },
      update: {},
      create: { id: `parada-pic-${i}`, rutaId: rutaPic.id, negocioId: negPicanterias[i].id, orden: i + 1, notaEs: `Parada ${i + 1}: ${negPicanterias[i].nombre}`, notaEn: `Stop ${i + 1}: ${negPicanterias[i].nombre}` },
    });
  }
  for (let i = 0; i < negSillar.length; i++) {
    await prisma.rutaParada.upsert({
      where:  { id: `parada-sillar-${i}` },
      update: {},
      create: { id: `parada-sillar-${i}`, rutaId: rutaSillar.id, negocioId: negSillar[i].id, orden: i + 1, notaEs: `Parada ${i + 1}: ${negSillar[i].nombre}`, notaEn: `Stop ${i + 1}: ${negSillar[i].nombre}` },
    });
  }
  for (let i = 0; i < negArtesanal.length; i++) {
    await prisma.rutaParada.upsert({
      where:  { id: `parada-art-${i}` },
      update: {},
      create: { id: `parada-art-${i}`, rutaId: rutaArt.id, negocioId: negArtesanal[i].id, orden: i + 1, notaEs: `Parada ${i + 1}: ${negArtesanal[i].nombre}`, notaEn: `Stop ${i + 1}: ${negArtesanal[i].nombre}` },
    });
  }

  console.log("✅ Rutas: 3 creadas con paradas");

  // ─── RESERVAS ───────────────────────────────────────────────────────────────
  const aprobados = negociosCreados.filter((_, i) => i < 12);
  const serviciosPorNegocio = await prisma.servicio.findMany({ where: { negocioId: { in: aprobados.map(n => n.id) } } });
  const getSrv = (negocioId: string) => serviciosPorNegocio.find(s => s.negocioId === negocioId);

  const reservasData = [
    // 2 pendientes
    { negocio: aprobados[0], turista: null,     nombre: "María López",   email: "mlopez@gmail.com",    whatsapp: "+51987001001", pais: "PE", fecha: "2026-11-20", hora: "12:30", personas: 2, estado: "pendiente",   canal: "web" },
    { negocio: aprobados[1], turista: tur1.id,  nombre: "Ana García",    email: "turista1@test.com",   whatsapp: "+51987001002", pais: "PE", fecha: "2026-11-21", hora: "10:00", personas: 1, estado: "pendiente",   canal: "web" },
    // 3 confirmadas
    { negocio: aprobados[2], turista: tur2.id,  nombre: "John Smith",    email: "turista2@test.com",   whatsapp: "+1555000001",  pais: "US", fecha: "2026-11-22", hora: "08:00", personas: 3, estado: "confirmada",  canal: "qr_hotel" },
    { negocio: aprobados[3], turista: null,     nombre: "Carlos Ruiz",   email: "cruiz@hotmail.com",   whatsapp: "+51987001003", pais: "PE", fecha: "2026-11-23", hora: "15:00", personas: 2, estado: "confirmada",  canal: "ruta" },
    { negocio: aprobados[4], turista: tur1.id,  nombre: "Ana García",    email: "turista1@test.com",   whatsapp: "+51987001002", pais: "PE", fecha: "2026-11-25", hora: "09:00", personas: 4, estado: "confirmada",  canal: "web" },
    // 2 completadas (tendrán reseña)
    { negocio: aprobados[0], turista: tur1.id,  nombre: "Ana García",    email: "turista1@test.com",   whatsapp: "+51987001002", pais: "PE", fecha: "2026-11-05", hora: "12:00", personas: 2, estado: "completada",  canal: "web" },
    { negocio: aprobados[2], turista: tur2.id,  nombre: "John Smith",    email: "turista2@test.com",   whatsapp: "+1555000001",  pais: "US", fecha: "2026-11-06", hora: "08:00", personas: 1, estado: "completada",  canal: "qr_hotel" },
    // 1 rechazada
    { negocio: aprobados[5], turista: null,     nombre: "Pedro Torres",  email: "ptorres@yahoo.com",   whatsapp: "+51987001004", pais: "PE", fecha: "2026-11-15", hora: "11:00", personas: 5, estado: "rechazada",   canal: "web" },
    // 1 cancelada
    { negocio: aprobados[6], turista: tur2.id,  nombre: "John Smith",    email: "turista2@test.com",   whatsapp: "+1555000001",  pais: "US", fecha: "2026-11-10", hora: "14:00", personas: 2, estado: "cancelada",   canal: "web" },
    // 1 no_asistio
    { negocio: aprobados[7], turista: null,     nombre: "Lucía Mendoza", email: "lmendoza@gmail.com",  whatsapp: "+51987001005", pais: "PE", fecha: "2026-11-08", hora: "16:00", personas: 1, estado: "no_asistio",  canal: "ruta" },
  ];

  const reservasCreadas: { id: string; negocioId: string; estado: string; nombre: string }[] = [];

  for (let i = 0; i < reservasData.length; i++) {
    const rd = reservasData[i];
    const codigo = `AQP-${(1000 + i).toString().toUpperCase()}`;
    const srv = getSrv(rd.negocio.id);
    const reserva = await prisma.reserva.upsert({
      where:  { codigo },
      update: {},
      create: {
        codigo, negocioId: rd.negocio.id, servicioId: srv?.id ?? null,
        turistaId: rd.turista, nombreContacto: rd.nombre,
        emailContacto: rd.email, whatsappContacto: rd.whatsapp,
        pais: rd.pais, fecha: rd.fecha, hora: rd.hora,
        personas: rd.personas, estado: rd.estado, canalOrigen: rd.canal,
      },
    });
    reservasCreadas.push({ id: reserva.id, negocioId: reserva.negocioId, estado: reserva.estado, nombre: rd.nombre });
  }

  console.log(`✅ Reservas: ${reservasCreadas.length} creadas`);

  // ─── RESEÑAS ────────────────────────────────────────────────────────────────
  const completadas = reservasCreadas.filter(r => r.estado === "completada");

  const resenasData = [
    { reserva: completadas[0], autor: "Ana García",  puntaje: 5, comentario: "Excelente experiencia, el rocoto relleno es espectacular. Muy recomendado.", idioma: "es" },
    { reserva: completadas[1], autor: "John Smith",  puntaje: 4, comentario: "Amazing tour, the guide was very knowledgeable. Great value for money.", idioma: "en" },
  ];

  for (let i = 0; i < resenasData.length; i++) {
    const rd = resenasData[i];
    if (!rd.reserva) continue;
    await prisma.resena.upsert({
      where:  { reservaId: rd.reserva.id },
      update: {},
      create: {
        reservaId: rd.reserva.id, negocioId: rd.reserva.negocioId,
        autorNombre: rd.autor, puntaje: rd.puntaje,
        comentario: rd.comentario, idioma: rd.idioma,
        estado: "visible",
      },
    });
    // Actualizar rating del negocio
    await prisma.negocio.update({
      where: { id: rd.reserva.negocioId },
      data:  { ratingPromedio: rd.puntaje, totalResenas: { increment: 1 } },
    });
  }

  console.log(`✅ Reseñas: ${resenasData.length} creadas (verificadas)`);

  // ─── QR CODES ───────────────────────────────────────────────────────────────
  const qrNegocio = aprobados[0];
  await prisma.qrCode.upsert({
    where:  { slugCorto: "pf-mesa1" },
    update: {},
    create: { tipo: "negocio", negocioId: qrNegocio.id, etiqueta: "Mesa 1", slugCorto: "pf-mesa1", escaneos: 12 },
  });
  await prisma.qrCode.upsert({
    where:  { slugCorto: "ruta-pic-hotel" },
    update: {},
    create: { tipo: "ruta", rutaId: rutaPic.id, etiqueta: "Hotel Casa Andina", slugCorto: "ruta-pic-hotel", escaneos: 7 },
  });

  console.log("✅ QR codes: 2 de ejemplo creados");

  // ─── RESUMEN ─────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed completado exitosamente:");
  console.log(`   👥 Usuarios:    6 (1 admin, 3 negocios, 2 turistas)`);
  console.log(`   🏷️  Categorías: 7`);
  console.log(`   🏪 Negocios:   14 (12 aprobados, 2 pendientes)`);
  console.log(`   🗺️  Rutas:       3 (con paradas)`);
  console.log(`   📅 Reservas:   10 (distintos estados)`);
  console.log(`   ⭐ Reseñas:     2 (verificadas)`);
  console.log(`   📱 QR codes:    2 de ejemplo`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
