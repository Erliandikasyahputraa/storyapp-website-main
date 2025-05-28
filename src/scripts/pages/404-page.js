export default class NotFoundPage {
  async render() {
    return `
      <section class="not-found-container">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <a href="#/">Return to Home</a>
      </section>
    `;
  }
}