import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsForm from '../../src/components/SettingsForm/SettingsForm';
import { useAuth } from '../../src/context/AuthContext';
import userUpdate from '../../src/services/userUpdate';

// 1. MOCK DEL SERVICIO
jest.mock('../../src/services/userUpdate');

// 2. MOCK DEL CONTEXTO
jest.mock('../../src/context/AuthContext', () => ({
    useAuth: jest.fn()
}));

// 3. MOCK DEL ROUTER
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('SettingsForm Component', () => {
    const mockSetAuthState = jest.fn();
    const mockHeaders = { Authorization: 'Token fake-token' };
    
    // Creamos un usuario falso para que el formulario lo lea al iniciar
    const defaultLoggedUser = {
        bio: 'Mi biografía original',
        email: 'test@mail.com',
        image: 'https://mi-imagen.com/foto.jpg',
        password: '',
        username: 'testuser'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debe redirigir al inicio si el usuario no está autenticado', () => {
        // Simulamos que isAuth es false para probar el useEffect
        useAuth.mockReturnValue({
            headers: null,
            isAuth: false,
            loggedUser: { email: '', username: '' }, // Evita errores de destructuring
            setAuthState: mockSetAuthState
        });

        render(<SettingsForm />);

        // Verificamos que el componente intentó echarnos a la pantalla principal
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('debe renderizar el formulario con los datos pre-cargados del usuario', () => {
        // Simulamos una sesión activa
        useAuth.mockReturnValue({
            headers: mockHeaders,
            isAuth: true,
            loggedUser: defaultLoggedUser,
            setAuthState: mockSetAuthState
        });

        render(<SettingsForm />);

        // getByDisplayValue busca inputs que contengan exactamente este texto en su interior
        expect(screen.getByDisplayValue('testuser')).toBeDefined();
        expect(screen.getByDisplayValue('test@mail.com')).toBeDefined();
        expect(screen.getByDisplayValue('Mi biografía original')).toBeDefined();
        expect(screen.getByDisplayValue('https://mi-imagen.com/foto.jpg')).toBeDefined();
    });

    it('debe llamar a userUpdate con los datos modificados al hacer submit', async () => {
        useAuth.mockReturnValue({
            headers: mockHeaders,
            isAuth: true,
            loggedUser: defaultLoggedUser,
            setAuthState: mockSetAuthState
        });

        userUpdate.mockResolvedValue({ user: { ...defaultLoggedUser, bio: 'Biografía editada' } });

        render(<SettingsForm />);

        // Encontramos el textarea por su placeholder para modificarlo
        const bioInput = screen.getByPlaceholderText('Short bio about you');
        fireEvent.change(bioInput, { target: { name: 'bio', value: 'Biografía editada' } });

        // Buscamos el input de password (está vacío por defecto) y le ponemos texto
        const passwordInput = screen.getByPlaceholderText('Password');
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'nuevapass123' } });

        // Enviamos el formulario
        fireEvent.click(screen.getByRole('button', { name: /update settings/i }));

        await waitFor(() => {
            // Verificamos que la API reciba los datos originales mezclados con los que modificamos
            expect(userUpdate).toHaveBeenCalledWith({
                headers: mockHeaders,
                bio: 'Biografía editada', // Este cambió
                email: 'test@mail.com',   // Este se mantuvo intacto
                image: 'https://mi-imagen.com/foto.jpg', // Intacto
                password: 'nuevapass123', // Este cambió
                username: 'testuser'      // Intacto
            });
            
            // Verificamos que actualizó el estado global
            expect(mockSetAuthState).toHaveBeenCalled();
        });
    });
});