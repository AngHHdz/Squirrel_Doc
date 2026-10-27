# Squirrel Doc Web — prototipo 0.1.0

Interfaz web estática en español para gestión local de archivos.

## Funciones actuales
- Interfaz responsive con mascota suministrada.
- Selección múltiple y arrastrar/soltar.
- Conversión de imágenes compatibles a PNG mediante Canvas.
- Exportación del listado a CSV.
- Estructura visual para información y hash SHA-256.

## Limitaciones del prototipo
- No hay servidor ni backend; los archivos se procesan en el navegador.
- La compatibilidad de conversión depende del navegador y del formato.
- La función hash puede requerir contexto seguro (HTTPS o localhost).
- No incluye todavía PDF, OCR, Office, audio/vídeo, ni creación de ZIP.
- El CSS importa una fuente de Google Fonts; para modo totalmente offline elimina esa línea y utiliza las fuentes de sistema.
- Esta versión no guarda ni sube archivos de usuario.

## Publicar en GitHub Pages
Sube el contenido de esta carpeta a la raíz de un repositorio y activa Settings → Pages → Deploy from a branch → main → /(root).

## Siguiente etapa
Añadir herramientas PDF con una biblioteca local revisada, compresión ZIP con una biblioteca empaquetada, y pruebas de seguridad y compatibilidad.
