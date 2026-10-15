
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

const projects = [];

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const item = document.createElement('li');

    const name = document.createElement('span');
    name.textContent = project.name;

    const status = document.createElement('span');
    status.textContent = ` — ${project.status}`;

    item.append(name, status);
    projectList.appendChild(item);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    nameInput.focus();
    return;
  }

  const project = {
    id: crypto.randomUUID(),
    name: name,
    status: status
  };

  projects.push(project);

  renderProjects();
  form.reset();
});
