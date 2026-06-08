-- Jalankan setelah backup database.
-- Menjadikan IDBarang integer primary key auto increment agar form tidak input ID manual.

ALTER TABLE log_transaksi
  MODIFY IDBarang INT NOT NULL;

ALTER TABLE master_barang
  MODIFY IDBarang INT NOT NULL,
  ADD PRIMARY KEY (IDBarang);

ALTER TABLE master_barang
  MODIFY IDBarang INT NOT NULL AUTO_INCREMENT;
