import { navigateTo } from '../main.js';

export function renderResultsScreen(container, data) {
    const { username } = data;

    container.innerHTML = `
        <div class="results-screen">
            <div class="results-header">
                <h1>📝 Información Personal</h1>
                <p class="form-description">Por favor, comparte algunos datos para finalizar</p>
            </div>
            
            <div class="results-content">
                <form id="user-data-form" class="user-data-form">
                    <div class="form-group">
                        <label for="username-display">Nombre de usuario</label>
                        <input 
                            type="text" 
                            id="username-display" 
                            name="username"
                            value="${username}"
                            readonly
                            class="form-input readonly"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Correo electrónico</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            placeholder="tu@email.com"
                            class="form-input"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="age">Edad</label>
                        <input 
                            type="number" 
                            id="age" 
                            name="age"
                            placeholder="25"
                            min="13"
                            max="99"
                            class="form-input"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="nationality">Nacionalidad</label>
                        <input 
                            type="text" 
                            id="nationality" 
                            name="nationality"
                            placeholder="Mexicana, Española, etc."
                            class="form-input"
                            required
                        />
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn primary submit-btn">
                            📤 Enviar Datos
                        </button>
                        <button type="button" class="btn secondary skip-btn" id="skip-btn">
                            ⏭️ Omitir
                        </button>
                    </div>
                </form>
                <div id="form-status" class="form-status" style="display: none;"></div>
            </div>
        </div>
    `;

    // Function to show form status
    function showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('form-status');
        statusDiv.className = `form-status ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    // Function to submit user data
    async function submitUserData(formData) {
        try {
            const response = await fetch('/api/user-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    age: parseInt(formData.age),
                    nationality: formData.nationality,
                }),
            });

            const result = await response.json();

            if (result.success) {
                showStatus(
                    '¡Datos enviados correctamente! Gracias por participar.',
                    'success'
                );
                setTimeout(() => {
                    redirectToMainPage();
                }, 2000);
            } else {
                showStatus(`Error: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            showStatus(
                'Error al enviar los datos. Por favor, intenta de nuevo.',
                'error'
            );
        }
    }

    // Function to redirect to username (main) page
    function redirectToMainPage() {
        navigateTo('/main');
    }

    // Form submission handler
    document
        .getElementById('user-data-form')
        .addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            // Validation
            if (!data.email || !data.age || !data.nationality) {
                showStatus(
                    'Por favor, completa todos los campos requeridos.',
                    'error'
                );
                return;
            }

            if (parseInt(data.age) < 13 || parseInt(data.age) > 99) {
                showStatus('La edad debe estar entre 13 y 99 años.', 'error');
                return;
            }

            // Disable form during submission
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '📤 Enviando...';

            showStatus('Enviando datos...', 'info');

            await submitUserData(data);

            // Re-enable form
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });

    // Skip button handler
    document.getElementById('skip-btn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres omitir este paso?')) {
            redirectToMainPage();
        }
    });
}
