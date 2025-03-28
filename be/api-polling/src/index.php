<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polling em PHP</title>
</head>
<body>
    <h2>Última atualização:</h2>
    <p id="update-message">Aguardando...</p>

    <script>
        function fetchUpdates() {
            fetch("api.php")
                .then(response => response.json())
                .then(data => {
                    document.getElementById("update-message").innerText = 
                        `Mensagem: ${data.message} (Timestamp: ${data.timestamp})`;
                })
                .catch(error => console.error("Erro ao buscar atualizações:", error));
        }

        // Faz polling a cada 5 segundos
        setInterval(fetchUpdates, 5000);

        // Chama a função logo ao carregar a página
        fetchUpdates();
    </script>
</body>
</html>