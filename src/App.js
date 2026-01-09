import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// --- Correção para o ícone do marcador que as vezes buga no React ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// --------------------------------------------------------------------

function App() {
  const [ipInput, setIpInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIp = async (ipAddress = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://ipwho.is/${ipAddress}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError(`Erro: ${result.message || 'IP não encontrado.'}`);
        setData(null);
      }
    } catch (err) {
      setError("Falha na conexão com o serviço.");
    }
    setLoading(false);
  };

  // Busca inicial (seu IP)
  useEffect(() => {
    fetchIp();
    // A linha abaixo manda a Vercel ignorar o aviso que estava travando o build
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIp(ipInput);
  };

  return (
    <div className="app-container">
      <header>
        <h1>📍 Localizador de IP C.F</h1>
      </header>
      
      <form className="search-bar" onSubmit={handleSearch}>
        <input 
          type="text"
          placeholder="Digite um endereço IP (ex: 8.8.8.8)..."
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Localizar'}
        </button>
      </form>

      <div className="content-body">
        {error && <div className="error-message">⚠️ {error}</div>}
        {loading && !data && <div className="loading-message">Triangulando sinal...</div>}
        
        {data && !loading && (
          <div className="content-grid">
            {/* Painel de Informações (Esquerda) */}
            <div className="info-panel">
              <div className="data-item">
                <span className="data-label">Endereço IP</span>
                <div className="data-value">{data.ip}</div>
              </div>
              <div className="data-item">
                <span className="data-label">Localização</span>
                <div className="data-value">
                  {data.city}, {data.region_code} - {data.country}
                  <img src={data.flag.img} alt={data.country} className="flag-img" />
                </div>
              </div>
               <div className="data-item">
                <span className="data-label">Fuso Horário</span>
                <div className="data-value">
                  {data.timezone.id} ({data.timezone.current_time})
                </div>
              </div>
              <div className="data-item">
                <span className="data-label">Provedor (ISP)</span>
                <div className="data-value">{data.connection.isp}</div>
              </div>
              <div className="data-item">
                <span className="data-label">Coordenadas GPS</span>
                <div className="data-value">{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</div>
              </div>

              {/* Botão para abrir no Google Maps Real */}
              <a 
                href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#34a853',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  marginTop: '20px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                🛰️ Ver Satélite (Google Maps)
              </a>
            </div>

            {/* Painel do Mapa (Direita) */}
            <div className="map-panel">
              <MapContainer 
                center={[data.latitude, data.longitude]} 
                zoom={13} 
                scrollWheelZoom={true}
                key={data.ip} 
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[data.latitude, data.longitude]}>
                  <Popup>
                    Localização aproximada de: <br /> <strong>{data.ip}</strong>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;