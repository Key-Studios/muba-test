export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic palette
        brand: {
          DEFAULT: '#3B82F6',
          emphasis: '#1D4ED8'
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f7fa',
          emphasis: '#f0f2f5'
        },
        // Pastel eliminado: reutilizamos nombres con escala de grises para compatibilidad
        pastel: {
          blue: '#e5e7eb',
          lilac: '#d1d5db',
          green: '#e5e7eb'
        },
        border: {
          DEFAULT: '#e2e8f0',
          emphasis: '#cbd5e1'
        },
        text: {
          DEFAULT: '#1f2937',
          subtle: '#6b7280',
          inverted: '#ffffff'
        },
        accent: {
          DEFAULT: '#6366F1',
          soft: '#EEF2FF',
          emphasis: '#4F46E5'
        },
        danger: {
          DEFAULT: '#DC2626',
          soft: '#FEE2E2'
        },
        warn: {
          DEFAULT: '#D97706',
          soft: '#FFEDD5'
        },
        success: {
          DEFAULT: '#059669',
          soft: '#D1FAE5'
        }
      }
    }
  },
  plugins: []
};
