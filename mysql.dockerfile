FROM mysql:9.4

# Install timezone data to fix the warnings
RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Copy initialization scripts if they exist
COPY ./backend/scripts/*.sql /docker-entrypoint-initdb.d/

# Set environment variables for secure initialization
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
ENV MYSQL_DATABASE=${MYSQL_DATABASE}
ENV MYSQL_USER=${MYSQL_USER}
ENV MYSQL_PASSWORD=${MYSQL_PASSWORD}

# Fix PID file permissions issue - use /tmp with restricted umask
RUN mkdir -p /tmp/mysqld && \
    chown -R mysql:mysql /tmp/mysqld && \
    chmod 700 /tmp/mysqld

# Create custom MySQL configuration to address warnings
RUN echo '[mysqld]' > /etc/mysql/conf.d/optimize.cnf && \
    echo 'pid-file=/tmp/mysqld/mysqld.pid' >> /etc/mysql/conf.d/optimize.cnf && \
    echo 'socket=/tmp/mysqld/mysqld.sock' >> /etc/mysql/conf.d/optimize.cnf && \
    echo 'character-set-server=utf8mb4' >> /etc/mysql/conf.d/optimize.cnf && \
    echo 'collation-server=utf8mb4_unicode_ci' >> /etc/mysql/conf.d/optimize.cnf && \
    echo 'log_bin_trust_function_creators=1' >> /etc/mysql/conf.d/optimize.cnf

# Ensure proper umask for MySQL process
RUN echo '[mysqld_safe]' > /etc/mysql/conf.d/umask.cnf && \
    echo 'umask=0077' >> /etc/mysql/conf.d/umask.cnf

# Expose MySQL port
EXPOSE 3306

# Set proper default charset and collation
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
