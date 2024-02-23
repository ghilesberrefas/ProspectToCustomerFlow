import mongoose from 'mongoose';

// Type pour le cache de connexion
type MongoCache = {
  conn: mongoose.Connection | null,
  promise: Promise<mongoose.Connection> | null
};

// Vérifie que MONGODB_URI est défini
const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  throw new Error('The MONGODB_URI must be defined');
}

// Déclare une variable globale pour le cache de connexion
declare global {
  var _mongoCache: MongoCache | undefined;
}

// Initialise le cache s'il n'existe pas encore
if (!global._mongoCache) {
  global._mongoCache = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (global._mongoCache!.conn) {
    return global._mongoCache!.conn;
  }

  if (!global._mongoCache!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering
    };

    global._mongoCache!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }
  global._mongoCache!.conn = await global._mongoCache!.promise;
  return global._mongoCache!.conn;
}

export default dbConnect;
