<?php
// Conexión a la base de datos
$host = '127.0.0.1';
$dbname = 'luminar';
$username = 'root';
$password = '';

// Crear conexión
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener datos JSON
$data = json_decode(file_get_contents("php://input"), true);

// Preparar y enlazar la consulta SQL
$stmt = $conn->prepare("INSERT INTO Productos (nombre_producto, descripcion, talla, color, precio, cantidad_stock, categoria_id, imagenes, especificaciones, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssdissss", $nombre_producto, $descripcion, $talla, $color, $precio, $cantidad_stock, $categoria_id, $imagenes, $especificaciones, $estado);

// Asignar valores desde los datos recibidos
$nombre_producto = $data['nombre_producto'];
$descripcion = $data['descripcion'];
$talla = $data['talla'];
$color = $data['color'];
$precio = $data['precio'];
$cantidad_stock = $data['cantidad_stock'];
$categoria_id = $data['categoria_id'];
$imagenes = $data['imagenes']; // Ya está en formato Base64
$especificaciones = $data['especificaciones'];
$estado = $data['estado'];

// Ejecutar consulta
if ($stmt->execute()) {
    echo json_encode(["message" => "Producto creado exitosamente"]);
} else {
    echo json_encode(["message" => "Error al crear el producto"]);
}

// Cerrar conexiones
$stmt->close();
$conn->close();
?>
