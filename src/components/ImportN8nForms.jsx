import React, { useState, useEffect } from 'react';

const ImportN8nForms = ({ onFormsImport }) => {
  const [availableForms, setAvailableForms] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    url: '',
    apiKey: ''
  });

  const fetchFormsFromN8n = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiConfig.url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': apiConfig.apiKey,
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      const workflows = await response.json();
      const forms = workflows.reduce((acc, workflow) => {
        const formNodes = workflow.nodes.filter(node => 
          node.type === 'n8n-nodes-base.form' || 
          node.type === 'n8n-nodes-base.formTrigger'
        );
        
        return [...acc, ...formNodes.map(node => ({
          id: node.id,
          name: node.parameters.name || `Form from ${workflow.name}`,
          fields: node.parameters.fields || [],
          workflowId: workflow.id
        }))];
      }, []);
      
      setAvailableForms(forms);
    } catch (error) {
      console.error('Error fetching n8n forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSelection = (formId) => {
    setSelectedForms(prev => {
      if (prev.includes(formId)) {
        return prev.filter(id => id !== formId);
      }
      return [...prev, formId];
    });
  };

  const handleImport = () => {
    const formsToImport = availableForms.filter(form => 
      selectedForms.includes(form.id)
    ).map(form => {
      return {
        ...form,
        name: generateUniqueName(form.name)
      };
    });

    onFormsImport(formsToImport);
    setSelectedForms([]);
  };

  const generateUniqueName = (baseName) => {
    let counter = 1;
    let newName = baseName;
    
    while (availableForms.some(form => form.name === newName)) {
      newName = `${baseName} - Copy ${counter}`;
      counter++;
    }
    
    return newName;
  };

  return (
    <div className="import-n8n-forms">
      <div className="api-config">
        <input
          type="text"
          placeholder="N8N API URL"
          value={apiConfig.url}
          onChange={(e) => setApiConfig(prev => ({ ...prev, url: e.target.value }))}
        />
        <input
          type="password"
          placeholder="API Key"
          value={apiConfig.apiKey}
          onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
        />
        <button 
          className="btn"
          onClick={fetchFormsFromN8n}
          disabled={isLoading || !apiConfig.url || !apiConfig.apiKey}
        >
          {isLoading ? 'Loading...' : 'Fetch Forms'}
        </button>
      </div>

      {availableForms.length > 0 && (
        <>
          <button
            className="btn btn-success"
            disabled={selectedForms.length === 0}
            onClick={handleImport}
          >
            Import Selected Forms
          </button>

          <div className="forms-list">
            {availableForms.map(form => (
              <div key={form.id} className="form-item">
                <input
                  type="checkbox"
                  checked={selectedForms.includes(form.id)}
                  onChange={() => handleFormSelection(form.id)}
                />
                <span>{form.name}</span>
                <small>({form.fields.length} fields)</small>
              </div>
            ))}
          </div>

          <button
            className="btn btn-success"
            disabled={selectedForms.length === 0}
            onClick={handleImport}
          >
            Import Selected Forms
          </button>
        </>
      )}
    </div>
  );
};

export default ImportN8nForms;
