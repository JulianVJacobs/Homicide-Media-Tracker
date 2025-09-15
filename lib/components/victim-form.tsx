'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, ListGroup } from 'react-bootstrap';
import { VictimData } from '@/lib/types/homicide';
import { townsByProvince } from '@/lib/data/towns-by-province';

interface VictimFormProps {
  onSubmit: (data: VictimData) => void;
  victims: VictimData[];
  onClearVictims: () => void;
}

const VictimForm: React.FC<VictimFormProps> = ({ onSubmit, victims, onClearVictims }) => {
  const [currentVictim, setCurrentVictim] = useState<VictimData>({
    victimName: '',
    dateOfDeath: '',
    province: '',
    town: '',
    locationType: '',
    sexualAssault: '',
    genderOfVictim: '',
    race: '',
    ageOfVictim: '',
    ageRangeOfVictim: '',
    modeOfDeathSpecific: '',
    modeOfDeathGeneral: '',
    policeStation: '',
  });

  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [customTown, setCustomTown] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Update available towns based on selected province
    if (currentVictim.province && townsByProvince[currentVictim.province]) {
      setAvailableTowns(townsByProvince[currentVictim.province]);
    } else {
      setAvailableTowns([]);
    }
  }, [currentVictim.province]);

  useEffect(() => {
    // Validate required fields
    const required = ['victimName', 'dateOfDeath', 'province', 'genderOfVictim'];
    const allRequiredFilled = required.every(field => 
      currentVictim[field as keyof VictimData].toString().trim() !== ''
    );
    setIsValid(allRequiredFilled);
  }, [currentVictim]);

  const handleChange = (field: keyof VictimData, value: string) => {
    setCurrentVictim(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVictim = () => {
    if (isValid) {
      const victimToAdd = { ...currentVictim };
      
      // Use custom town if "Other" was selected
      if (currentVictim.town === 'Other' && customTown.trim()) {
        victimToAdd.town = customTown.trim();
      }
      
      onSubmit(victimToAdd);
      
      // Reset form
      setCurrentVictim({
        victimName: '',
        dateOfDeath: '',
        province: '',
        town: '',
        locationType: '',
        sexualAssault: '',
        genderOfVictim: '',
        race: '',
        ageOfVictim: '',
        ageRangeOfVictim: '',
        modeOfDeathSpecific: '',
        modeOfDeathGeneral: '',
        policeStation: '',
      });
      setCustomTown('');
    }
  };

  const provinceOptions = [
    { value: '', label: 'Select Province' },
    { value: 'Eastern Cape', label: 'Eastern Cape' },
    { value: 'Free State', label: 'Free State' },
    { value: 'Gauteng', label: 'Gauteng' },
    { value: 'KwaZulu-Natal', label: 'KwaZulu-Natal' },
    { value: 'Limpopo', label: 'Limpopo' },
    { value: 'Mpumalanga', label: 'Mpumalanga' },
    { value: 'Northern Cape', label: 'Northern Cape' },
    { value: 'North West', label: 'North West' },
    { value: 'Western Cape', label: 'Western Cape' },
  ];

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Unknown', label: 'Unknown' },
  ];

  const raceOptions = [
    { value: '', label: 'Select Race' },
    { value: 'African', label: 'African' },
    { value: 'Coloured', label: 'Coloured' },
    { value: 'Indian', label: 'Indian' },
    { value: 'White', label: 'White' },
    { value: 'Unknown', label: 'Unknown' },
    { value: 'Other', label: 'Other' },
  ];

  const ageRangeOptions = [
    { value: '', label: 'Select Age Range' },
    { value: '0-10', label: '0-10 years' },
    { value: '11-17', label: '11-17 years' },
    { value: '18-25', label: '18-25 years' },
    { value: '26-35', label: '26-35 years' },
    { value: '36-45', label: '36-45 years' },
    { value: '46-55', label: '46-55 years' },
    { value: '56-65', label: '56-65 years' },
    { value: '66+', label: '66+ years' },
    { value: 'Unknown', label: 'Unknown' },
  ];

  const locationTypeOptions = [
    { value: '', label: 'Select Location Type' },
    { value: 'Residential', label: 'Residential' },
    { value: 'Street', label: 'Street' },
    { value: 'Business', label: 'Business' },
    { value: 'School', label: 'School' },
    { value: 'Park', label: 'Park' },
    { value: 'Rural', label: 'Rural' },
    { value: 'Other', label: 'Other' },
  ];

  const yesNoOptions = [
    { value: '', label: 'Select' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: 'Unknown', label: 'Unknown' },
  ];

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Victim Information</h4>
          {victims.length > 0 && (
            <Button variant="outline-danger" size="sm" onClick={onClearVictims}>
              Clear All Victims
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {victims.length > 0 && (
          <Alert variant="info" className="mb-3">
            <strong>{victims.length} victim(s) added:</strong>
            <ListGroup variant="flush" className="mt-2">
              {victims.map((victim, index) => (
                <ListGroup.Item key={index} className="px-0">
                  <strong>{victim.victimName}</strong> - {victim.genderOfVictim}, Age: {victim.ageOfVictim || victim.ageRangeOfVictim}, {victim.province}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Victim Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={currentVictim.victimName}
                  onChange={(e) => handleChange('victimName', e.target.value)}
                  placeholder="Full name of victim"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date of Death *</Form.Label>
                <Form.Control
                  type="date"
                  value={currentVictim.dateOfDeath}
                  onChange={(e) => handleChange('dateOfDeath', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Province *</Form.Label>
                <Form.Select
                  value={currentVictim.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  required
                >
                  {provinceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Town</Form.Label>
                <Form.Select
                  value={currentVictim.town}
                  onChange={(e) => handleChange('town', e.target.value)}
                  disabled={!currentVictim.province}
                >
                  <option value="">Select Town</option>
                  {availableTowns.map(town => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </Form.Select>
                {currentVictim.town === 'Other' && (
                  <Form.Control
                    type="text"
                    className="mt-2"
                    value={customTown}
                    onChange={(e) => setCustomTown(e.target.value)}
                    placeholder="Enter custom town name"
                  />
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gender *</Form.Label>
                <Form.Select
                  value={currentVictim.genderOfVictim}
                  onChange={(e) => handleChange('genderOfVictim', e.target.value)}
                  required
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Race</Form.Label>
                <Form.Select
                  value={currentVictim.race}
                  onChange={(e) => handleChange('race', e.target.value)}
                >
                  {raceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  value={currentVictim.ageOfVictim}
                  onChange={(e) => handleChange('ageOfVictim', e.target.value)}
                  placeholder="Exact age if known"
                  min="0"
                  max="120"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Age Range</Form.Label>
                <Form.Select
                  value={currentVictim.ageRangeOfVictim}
                  onChange={(e) => handleChange('ageRangeOfVictim', e.target.value)}
                >
                  {ageRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Location Type</Form.Label>
                <Form.Select
                  value={currentVictim.locationType}
                  onChange={(e) => handleChange('locationType', e.target.value)}
                >
                  {locationTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Police Station</Form.Label>
                <Form.Control
                  type="text"
                  value={currentVictim.policeStation}
                  onChange={(e) => handleChange('policeStation', e.target.value)}
                  placeholder="Name of police station"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Sexual Assault</Form.Label>
                <Form.Select
                  value={currentVictim.sexualAssault}
                  onChange={(e) => handleChange('sexualAssault', e.target.value)}
                >
                  {yesNoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Mode of Death (General)</Form.Label>
                <Form.Control
                  type="text"
                  value={currentVictim.modeOfDeathGeneral}
                  onChange={(e) => handleChange('modeOfDeathGeneral', e.target.value)}
                  placeholder="e.g., Gunshot, Stabbing"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Mode of Death (Specific)</Form.Label>
                <Form.Control
                  type="text"
                  value={currentVictim.modeOfDeathSpecific}
                  onChange={(e) => handleChange('modeOfDeathSpecific', e.target.value)}
                  placeholder="Specific details"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button 
              variant="primary"
              onClick={handleAddVictim}
              disabled={!isValid}
            >
              Add Victim
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default VictimForm;
