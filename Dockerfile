FROM php:8.2-apache

# Install required PHP extensions for MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite for nice URLs if ever needed
RUN a2enmod rewrite

# Copy the entire project into the Apache document root
COPY . /var/www/html/

# Ensure the uploads directory exists and has the right permissions
RUN mkdir -p /var/www/html/php/uploads && \
    chown -R www-data:www-data /var/www/html/php/uploads && \
    chmod -R 777 /var/www/html/php/uploads

# Expose port 80 (Render maps this automatically)
EXPOSE 80
