function notFound(req, res) {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = status >= 500 ? 'Terjadi kesalahan server' : err.message;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ success: false, error: message });
}

module.exports = { notFound, errorHandler };
