const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';

let projects = [];
let editingId = null;
let storageReady = false;

function showMessage(text) {
  message.textContent = text;
}

function isValidProjects(data) {
  if (!Array.isArray(data)) return false;

  const ids = new Set();

  for (const project of data) {
    if (
      !project ||
      typeof project !== 'object' ||
      typeof project.id !== 'string' ||
      !project.id ||
      typeof project.name !== 'string' ||
      !project.name.trim() ||
      !['Planned', 'In Progress', 'Completed'].includes(project.status) ||
      ids.has(project.id)
    ) {
      return false;
    }

    ids.add(project.id);
  }

  return true;
}

function loadProjects() {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);

    if (savedText === null) {
      projects = [];
      return true;
    }

    const savedProjects = JSON.parse(savedText);

    if (!isValidProjects(savedProjects)) {
      showMessage(
        'Saved project data is invalid. Existing saved data was not changed.'
      );
      return false;
    }

    projects = savedProjects;
    return true;
  } catch (error) {
    showMessage(
      'Could not read saved projects. Check browser storage settings.'
    );
    return false;
  }
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    showMessage('Projects saved successfully.');
    return true;
  } catch (error) {
    showMessage('Changes could not be saved to browser storage.');
    return false;
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Add project';
  cancelButton.hidden = true;
}

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const item = document.createElement('li');

    const name = document.createElement('span');
    name.textContent = project.name;

    const status = document.createElement('span');
    status.textContent = ` — ${project.status} `;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.disabled = !storageReady;

    editButton.addEventListener('click', () => {
      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;
      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;
      nameInput.focus();
      showMessage('Editing project.');
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.disabled = !storageReady;

    deleteButton.addEventListener('click', () => {
      if (!window.confirm(`Delete "${project.name}"?`)) {
        return;
      }

      const previousProjects = projects;
      projects = projects.filter(item => item.id !== project.id);

      if (!saveProjects()) {
        projects = previousProjects;
        renderProjects();
        return;
      }

      if (editingId === project.id) {
        resetForm();
      }

      renderProjects();
      showMessage('Project deleted and saved.');
    });

    item.append(name, status, editButton, deleteButton);
    projectList.appendChild(item);
  });

  emptyState.hidden = projects.length > 0;
}

form.addEventListener('submit', event => {
  event.preventDefault();

  if (!storageReady) {
    showMessage(
      'Storage is not ready. Please check the saved-data or storage error above.'
    );
    return;
  }

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    nameInput.focus();
    showMessage('Please enter a project name.');
    return;
  }

  const previousProjects = projects.map(project => ({ ...project }));

  if (editingId !== null) {
    const project = projects.find(item => item.id === editingId);

    if (!project) {
      showMessage('Project not found.');
      resetForm();
      return;
    }

    project.name = name;
    project.status = status;
  } else {
    projects.push({
      id: crypto.randomUUID(),
      name: name,
      status: status
    });
  }

  if (!saveProjects()) {
    projects = previousProjects;
    renderProjects();
    return;
  }

  renderProjects();
  resetForm();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  showMessage('Edit cancelled. Saved projects were not changed.');
});

// Load saved data before enabling changes.
storageReady = loadProjects();
renderProjects();