import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, PageSection } from '@patternfly/react-core';
import { CardBody } from '@components/Card';
import JobTemplateForm from '../shared/JobTemplateForm';
import { JobTemplatesAPI } from '@api';

function JobTemplateAdd() {
  const [formSubmitError, setFormSubmitError] = useState(null);
  const history = useHistory();

  async function handleSubmit(values) {
    const {
      labels,
      organizationId,
      instanceGroups,
      initialInstanceGroups,
      credentials,
      ...remainingValues
    } = values;

    setFormSubmitError(null);
    try {
      const {
        data: { id, type },
      } = await JobTemplatesAPI.create(remainingValues);
      await Promise.all([
        submitLabels(id, labels, organizationId),
        submitInstanceGroups(id, instanceGroups),
        submitCredentials(id, credentials),
      ]);
      history.push(`/templates/${type}/${id}/details`);
    } catch (error) {
      setFormSubmitError(error);
    }
  }

  function submitLabels(templateId, labels = [], organizationId) {
    const associationPromises = labels
      .filter(label => !label.isNew)
      .map(label => JobTemplatesAPI.associateLabel(templateId, label));
    const creationPromises = labels
      .filter(label => label.isNew)
      .map(label =>
        JobTemplatesAPI.generateLabel(templateId, label, organizationId)
      );

    return Promise.all([...associationPromises, ...creationPromises]);
  }

  function submitInstanceGroups(templateId, addedGroups = []) {
    const associatePromises = addedGroups.map(group =>
      JobTemplatesAPI.associateInstanceGroup(templateId, group.id)
    );
    return Promise.all(associatePromises);
  }

  function submitCredentials(templateId, credentials = []) {
    const associateCredentials = credentials.map(cred =>
      JobTemplatesAPI.associateCredentials(templateId, cred.id)
    );
    return Promise.all(associateCredentials);
  }

  function handleCancel() {
    history.push(`/templates`);
  }

  return (
    <PageSection>
      <Card>
        <CardBody>
          <JobTemplateForm
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
          />
        </CardBody>
        {formSubmitError ? <div>formSubmitError</div> : ''}
      </Card>
    </PageSection>
  );
}

export default JobTemplateAdd;
