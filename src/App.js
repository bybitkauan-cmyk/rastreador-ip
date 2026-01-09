import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// --- Correção de ícone do Leaflet ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

  useEffect(() => {
    fetchIp();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIp(ipInput);
  };

  return (
    <div className="app-container">
      <header>
        {/* MUDANÇA 1: Nome Atualizado */}
        <h1>📍 Localizador de IP C.F</h1>
      </header>
      
      <form className="search-bar" onSubmit={handleSearch}>
        <input 
          type="text"
          placeholder="Digite um endereço IP..."
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Rastreando...' : 'Localizar'}
        </button>
      </form>

      <div className="content-body">
        {error && <div className="error-message">⚠️ {error}</div>}
        {loading && !data && <div className="loading-message">Triangulando sinal...</div>}
        
        {data && !loading && (
          <div className="content-grid">
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

              {/* MUDANÇA 2: Mais dados técnicos */}
              <div className="data-item">
                <span className="data-label">Fuso Horário & Hora Atual</span>
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

              {/* MUDANÇA 3: Botão de Satélite Google */}
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#34a853',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  marginTop: '15px'
                }}
              >
                🛰️ Ver no Google Maps (Satélite)
              </a>

            </div>

            <div className="map-panel">
              <MapContainer 
                center={[data.latitude, data.longitude]} 
                zoom={13} 
                scrollWheelZoom={true}
                key={data.ip} 
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[data.latitude, data.longitude]}>
                  <Popup>
                    {data.connection.isp} <br /> {data.city}
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