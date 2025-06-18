/**
 * Services Loader for SECHS AUGEN PRINZIP UG
 * Dynamically loads and renders services from services.json
 */

class ServicesLoader {
    constructor(jsonPath = 'services.json') {
        this.jsonPath = jsonPath;
        this.services = null;
    }

    async loadServices() {
        try {
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.services = await response.json();
            return this.services;
        } catch (error) {
            console.error('Error loading services:', error);
            return null;
        }
    }

    renderServices(containerId, priceType = 'subunternehmer') {
        const container = document.getElementById(containerId);
        if (!container || !this.services) {
            console.error('Container not found or services not loaded');
            return;
        }

        let html = '';
        
        // Regular services (exclude crypto which is special)
        const regularServices = Object.entries(this.services.services)
            .filter(([key, service]) => !service.special);
        
        const specialServices = Object.entries(this.services.services)
            .filter(([key, service]) => service.special);

        // Render regular services
        regularServices.forEach(([key, service]) => {
            html += this.renderServiceBlock(service, priceType);
        });

        // Render special services at the end
        specialServices.forEach(([key, service]) => {
            html += this.renderSpecialServiceBlock(service, priceType);
        });

        container.innerHTML = html;
    }

    renderServiceBlock(service, priceType) {
        // Add id="audit" to the Erstprüfung & Analyse section
        const serviceId = service.title === 'Erstprüfung & Analyse' ? 'id="audit"' : '';
        
        let html = `
            <article class="service-block" ${serviceId}>
                <h3><span role="img" aria-label="${service.title}">${service.icon}</span> ${service.title}</h3>
                <ul class="price-list">`;

        // Main description header if exists
        if (service.description) {
            html += `
                    <li class="price-item" style="background: #f8f9fa; padding: 10px; margin: -10px -10px 10px; border-radius: 6px;">
                        <span class="description"><strong style="font-size: 16px; color: #37474F;">${service.description}</strong></span>
                        <span class="price"></span>
                    </li>`;
        }

        // Main service items
        if (service.items) {
            service.items.forEach(item => {
                const price = priceType === 'endkunden' ? item.price_endkunden : item.price_subunternehmer;
                html += `
                    <li class="price-item">
                        <span class="description">→ ${item.description}</span>
                        <span class="price">${price}</span>
                    </li>`;
                
                // Add details if available
                if (item.details) {
                    item.details.forEach(detail => {
                        html += `
                    <li class="price-item">
                        <span class="description">→ ${detail}</span>
                        <span class="price"></span>
                    </li>`;
                    });
                }
            });
        }

        // Additional services section
        if (service.additional_services) {
            html += `
                    <li class="price-item" style="margin-top: 15px; background: #f8f9fa; padding: 10px; margin-left: -10px; margin-right: -10px; border-radius: 6px;">
                        <span class="description"><strong style="font-size: 16px; color: #37474F;">${service.additional_services.title}</strong></span>
                        <span class="price"></span>
                    </li>`;

            service.additional_services.items.forEach(item => {
                const price = priceType === 'endkunden' ? item.price_endkunden : item.price_subunternehmer;
                html += `
                    <li class="price-item">
                        <span class="description">${item.description}</span>
                        <span class="price">${price}</span>
                    </li>`;
            });
        }

        html += `
                </ul>
                <p class="note">${service.note}</p>
            </article>`;

        return html;
    }

    renderSpecialServiceBlock(service, priceType) {
        const price = priceType === 'endkunden' ? service.price_endkunden : service.price_subunternehmer;
        
        let html = `
            <section class="service-block special-service" style="margin-top: 30px;">
                <h3><span role="img" aria-label="${service.title}">${service.icon}</span> ${service.title}</h3>
                <p>${service.description}</p>`;

        if (service.features) {
            html += `<p>${service.features.join(' • ')}</p>`;
        }

        html += `
                <p style="font-size: 18px; margin-top: 15px;"><strong>${price}</strong></p>
            </section>`;

        return html;
    }

    // Update specific service
    async updateService(serviceKey, updatedData) {
        if (!this.services) {
            await this.loadServices();
        }
        
        if (this.services && this.services.services[serviceKey]) {
            this.services.services[serviceKey] = { ...this.services.services[serviceKey], ...updatedData };
            return true;
        }
        return false;
    }

    // Get specific service
    getService(serviceKey) {
        return this.services?.services[serviceKey] || null;
    }

    // Get all services
    getAllServices() {
        return this.services?.services || null;
    }
}

// Usage example:
/*
const servicesLoader = new ServicesLoader();

// Load and render services
servicesLoader.loadServices().then(() => {
    // For Subunternehmer page
    servicesLoader.renderServices('services-container', 'subunternehmer');
    
    // For Endkunden page  
    servicesLoader.renderServices('services-container', 'endkunden');
});
*/