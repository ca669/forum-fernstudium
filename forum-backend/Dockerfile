FROM php:8.4-cli

# 1. System-Pakete installieren (für Composer/Zip benötigt)
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis setzen
WORKDIR /var/www/html

# Composer installieren
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Projekt in den Container kopieren und Abhängigkeiten installieren
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Wir erstellen den Ordner und geben volle Schreibrechte, damit SQLite funktioniert
RUN mkdir -p var && \
    chmod -R 777 var

# Port freigeben
EXPOSE 8080

# Start-Befehl (Migration + Seeder + PHP Built-in Server)
CMD ["sh", "-c", "vendor/bin/phinx migrate && vendor/bin/phinx seed:run && php -S 0.0.0.0:8080 -t public public/index.php"]