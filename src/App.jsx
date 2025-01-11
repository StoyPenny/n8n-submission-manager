import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function FormBuilder({ onFormSave, initialForm = null }) {
    const [formFields, setFormFields] = useState(initialForm ? initialForm.fields : []);
    const [n8nEndpoint, setN8nEndpoint] = useState(initialForm ? initialForm.n8nEndpoint : '');
    const [formName, setFormName] = useState(initialForm ? initialForm.name : '');
    const [formTags, setFormTags] = useState(initialForm ? initialForm.tags : '');
    const [formCategory, setFormCategory] = useState(initialForm ? initialForm.category : '');

    useEffect(() => {
        if (initialForm) {
            setFormFields(initialForm.fields);
            setN8nEndpoint(initialForm.n8nEndpoint);
            setFormName(initialForm.name);
            setFormTags(initialForm.tags);
            setFormCategory(initialForm.category);
        }
    }, [initialForm]);

    const sanitizeFieldName = (label) => {
        return label.toLowerCase().replace(/\s+/g, '-');
    };

    const addField = (type) => {
        const newField = {
            id: uuidv4(),
            type,
            label: `Field ${formFields.length + 1}`,
            placeholder: '',
            required: false,
            defaultValue: '',
            options: type === 'select' ? ['Option 1', 'Option 2'] : [],
        };
        setFormFields([...formFields, newField]);
    };

    const handleFieldNameChange = (fieldId, value) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                return { ...field, name: value };
            }
            return field;
        });
        setFormFields(updatedFields);
    };

    const handleLabelChange = (fieldId, value) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                const sanitizedName = field.name || sanitizeFieldName(value);
                return { ...field, label: value, name: sanitizedName };
            }
            return field;
        });
        setFormFields(updatedFields);
    };

    const handleDefaultValueChange = (fieldId, value) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                return { ...field, defaultValue: value };
            }
            return field;
        });
        setFormFields(updatedFields);
    };
    const handlePlaceholderChange = (fieldId, value) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                return { ...field, placeholder: value };
            }
            return field;
        });
        setFormFields(updatedFields);
    };

    const handleRequiredChange = (fieldId, value) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                return { ...field, required: value };
            }
            return field;
        });
        setFormFields(updatedFields);
    };

    const handleOptionChange = (fieldId, index, value) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                const updatedOptions = [...field.options];
                updatedOptions[index] = value;
                return { ...field, options: updatedOptions };
            }
            return field;
        });
        setFormFields(updatedFields);
    };

    const addOption = (fieldId) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                return { ...field, options: [...field.options, `Option ${field.options.length + 1}`] };
            }
            return field;
        });
        setFormFields(updatedFields);
    };

    const removeOption = (fieldId, index) => {
        const updatedFields = formFields.map((field) => {
            if (field.id === fieldId) {
                const updatedOptions = field.options.filter((_, i) => i !== index);
                return { ...field, options: updatedOptions };
            }
            return field;
        });
        setFormFields(updatedFields);
    };

    const removeField = (fieldId) => {
        setFormFields(formFields.filter((field) => field.id !== fieldId));
    };

    const handleSaveForm = () => {
        const form = {
            id: initialForm ? initialForm.id : uuidv4(),
            name: formName,
            fields: formFields,
            n8nEndpoint: n8nEndpoint,
            tags: formTags,
            category: formCategory,
        };
        onFormSave(form);
    };

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(formFields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFormFields(items);
    };

    return (
        <div className="form-builder">
            <div className="form-controls">
                <input
                    type="text"
                    placeholder="Form Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                />
                <select name='form-type'>
                    <option value="" disabled="disabled">Choose form submission type</option>
                    <option value="forms-test" selected="selected">Test</option>
                    <option value="forms">Production</option>
                </select>
                <input
                    type="text"
                    placeholder="n8n Endpoint URL"
                    value={n8nEndpoint}
                    onChange={(e) => setN8nEndpoint(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                />
                <button onClick={() => addField('text')} class="btn">Add Text Field</button>
                <button onClick={() => addField('textarea')} class="btn">Add Textarea</button>
                <button onClick={() => addField('select')} class="btn">Add Select</button>
                <button onClick={() => addField('date')}class="btn">Add Date Field</button>
                <button onClick={() => addField('email')} class="btn">Add Email Field</button>
                <button onClick={() => addField('file')} class="btn">Add File Field</button>
                <button onClick={() => addField('number')} class="btn">Add Number Field</button>
                <button onClick={() => addField('password')} class="btn">Add Password Field</button>
                <button onClick={handleSaveForm} class="btn btn-success">Save Form</button>
            </div>
            <div className="form-preview">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="form-fields">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {formFields.map((field, index) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="form-field"
                                            >
                                                <h3 className="field-type">{field.type.toUpperCase()}</h3>

                                                <label>
                                                    Label:
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => handleLabelChange(field.id, e.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    Placeholder:
                                                    <input
                                                        type="text"
                                                        value={field.placeholder}
                                                        onChange={(e) => handlePlaceholderChange(field.id, e.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    Default Value:
                                                    <input
                                                        type="text"
                                                        value={field.defaultValue || ''}
                                                        onChange={(e) => handleDefaultValueChange(field.id, e.target.value)}
                                                    />
                                                </label>
                                                <label>
                                                    Required:
                                                    <span className="toggle-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={(e) => handleRequiredChange(field.id, e.target.checked)}
                                                            id={`required-${field.id}`}
                                                        />
                                                        <span className="slider"></span>
                                                    </span>
                                                </label>
                                                <button onClick={() => removeField(field.id)} class="btn btn-danger">Remove</button>
                                                {field.type === 'select' && (
                                                    <div>
                                                        {field.options.map((option, index) => (
                                                            <div key={index}>
                                                                <input
                                                                    type="text"
                                                                    value={option}
                                                                    onChange={(e) => handleOptionChange(field.id, index, e.target.value)}
                                                                />
                                                                <button onClick={() => removeOption(field.id, index)} class="btn btn-danger">Remove</button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addOption(field.id)} class="btn btn-success">Add Option</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}

function FormList({ forms, onEditForm, onDeleteForm, onFormSubmit }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTag, setFilterTag] = useState('');

    const filteredForms = forms.filter((form) => {
        const searchMatch =
            !searchTerm || form.name.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch =
            !filterCategory || form.category.toLowerCase() === filterCategory.toLowerCase();
        const tagMatch =
            !filterTag || form.tags.toLowerCase().includes(filterTag.toLowerCase());
        return searchMatch && categoryMatch && tagMatch;
    });

    const categories = [...new Set(forms.map((form) => form.category))].filter(Boolean);
    const tags = [...new Set(forms.flatMap((form) => form.tags.split(',').map(tag => tag.trim())))].filter(Boolean);

    return (
        <div className="form-list">
            <div className="form-list-header">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                >
                    <option value="">All Tags</option>
                    {tags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>
            <ul>
                {filteredForms.map((form) => (
                    <li key={form.id}>
                        <span onClick={() => onFormSubmit(form)}>{form.name}</span>
                        <div>
                            <button onClick={() => onEditForm(form)} class="btn">Edit</button>
                            <button onClick={() => onDeleteForm(form.id)} class="btn btn-danger">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FormSubmit({ form, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(() => {
        const initialData = {};
        form.fields.forEach(field => {
            if (!field.name && field.defaultValue) {
                initialData[field.name] = field.defaultValue;
            }
        });
        return initialData;
    });

    const handleInputChange = (fieldId, value) => {
        setFormData({ ...formData, [fieldId]: value });
    };    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(form.n8nEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert('Form data sent successfully!');
                setFormData({});
                onSubmit();
            } else {
                alert('Failed to send form data.');
            }
        } catch (error) {
            console.error('Error sending form data:', error);
            alert('An error occurred while sending form data.');
        }
    };

    return (
        <div className="form-submit">
            <h2>{form.name}</h2>
            <form onSubmit={handleSubmit}>
                {form.fields.map((field) => (
                    <div key={field.id} className="form-field">
                        <label>{field.label}</label>
                        {field.type === 'text' && (
                            <input
                                type="text"
                                placeholder={field.placeholder}
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                                name={field.label}
                            />
                        )}
                        {field.type === 'textarea' && (
                            <textarea
                                placeholder={field.placeholder}
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                                name={field.label}
                            />
                        )}
                        {field.type === 'select' && (
                            <select
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                            >
                                <option value="" disabled>Select an option</option>
                                {field.options.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        )}
                        {field.type === 'date' && (
                            <input
                                type="date"
                                placeholder={field.placeholder}
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                            />
                        )}
                        {field.type === 'email' && (
                            <input
                                type="email"
                                placeholder={field.placeholder}
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                            />
                        )}
                        {field.type === 'file' && (
                            <input
                                type="file"
                                placeholder={field.placeholder}
                                onChange={(e) => handleInputChange(field.id, e.target.files[0])}
                                required={field.required}
                            />
                        )}
                        {field.type === 'number' && (
                            <input
                                type="number"
                                placeholder={field.placeholder}
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                            />
                        )}
                        {field.type === 'password' && (
                            <input
                                type="password"
                                placeholder={field.placeholder}
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                            />
                        )}
                    </div>
                ))}
                <button type="submit" class="btn btn-success">Submit</button>
                <button type="button" onClick={onCancel} class="btn btn-danger">Cancel</button>
            </form>
        </div>
    );
}

function App() {
    const [forms, setForms] = useState(() => {
        const storedForms = localStorage.getItem('forms');
        return storedForms ? JSON.parse(storedForms) : [];
    });
    const [currentView, setCurrentView] = useState('list');
    const [editingForm, setEditingForm] = useState(null);
    const [submittingForm, setSubmittingForm] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        show: false,
        formId: null,
    });

    useEffect(() => {
        localStorage.setItem('forms', JSON.stringify(forms));
    }, [forms]);

    const handleFormSave = (form) => {
        if (editingForm) {
            const updatedForms = forms.map((f) => (f.id === form.id ? form : f));
            setForms(updatedForms);
            setEditingForm(null);
        } else {
            setForms([...forms, form]);
        }
        setCurrentView('list');
    };

    const handleEditForm = (form) => {
        setEditingForm(form);
        setCurrentView('builder');
    };

    const handleDeleteForm = (formId) => {
        setDeleteConfirmation({ show: true, formId });
    };

    const confirmDeleteForm = () => {
        const updatedForms = forms.filter((form) => form.id !== deleteConfirmation.formId);
        setForms(updatedForms);
        setDeleteConfirmation({ show: false, formId: null });
    };

    const cancelDeleteForm = () => {
        setDeleteConfirmation({ show: false, formId: null });
    };

    const handleFormSubmit = (form) => {
        setSubmittingForm(form);
        setCurrentView('submit');
    };

    const handleCancelSubmit = () => {
        setSubmittingForm(null);
        setCurrentView('list');
    };

    const handleAfterSubmit = () => {
        setSubmittingForm(null);
        setCurrentView('list');
    }

    return (
        <div>
            <nav class="main-nav">
                <div>
                    <button class="btn btn-nav" onClick={() => setCurrentView('list')}>View Forms</button>
                    <button class="btn btn-nav" onClick={() => {
                        setCurrentView('builder');
                        setEditingForm(null);
                    }}>Create New Form</button>
                </div>
            </nav>
            <div className="form-container">

                {currentView === 'builder' && (
                    <FormBuilder onFormSave={handleFormSave} initialForm={editingForm} />
                )}
                {currentView === 'list' && (
                    <FormList
                        forms={forms}
                        onEditForm={handleEditForm}
                        onDeleteForm={handleDeleteForm}
                        onFormSubmit={handleFormSubmit}
                    />
                )}
                {currentView === 'submit' && submittingForm && (
                    <FormSubmit
                        form={submittingForm}
                        onSubmit={handleAfterSubmit}
                        onCancel={handleCancelSubmit}
                    />
                )}
                {deleteConfirmation.show && (
                    <div className="modal">
                        <div className="modal-content">
                            <p>Are you sure you want to delete this form?</p>
                            <button onClick={confirmDeleteForm}>Yes</button>
                            <button onClick={cancelDeleteForm}>No</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
