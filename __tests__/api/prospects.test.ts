import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../src/pages/api/prospects/index';

const mockRequest = (sessionData: Partial<NextApiRequest> = {}) => {
  return {
    headers: {},
    query: {},
    body: {},
    ...sessionData,
  } as NextApiRequest;
};

const mockResponse = () => {
    const res: Partial<NextApiResponse> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res as NextApiResponse;
  };
  

describe("/api/prospects", () => {
    it("GET should return all prospects", async () => {
        const req = mockRequest({ method: 'GET' });
        const res = mockResponse();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("POST should create a new prospect", async () => {
        const req = mockRequest({
          method: 'POST',
          body: { 
            nom: `Test Prospect ${Date.now()}`, 
            email: `test${Date.now()}@example.com`, 
            interets: ['dev', 'design'],
            statut: 'Prospect',
          },
        });
        const res = mockResponse();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.any(Object)); 
      }, 10000);
      
  let createdProspectId1: any;
  let createdProspectId2: any;
  let emailId1: string;

  beforeAll(async () => {
    emailId1 = `test1${Date.now()}@example.com`
    let req = mockRequest({
      method: 'POST',
      body: {
        nom: `Test Prospect ${Date.now()}`,
        email: emailId1,
        interets: ['dev', 'design'],
        statut: 'Prospect',
      },
    });
    let res = mockResponse();
    await handler(req, res);
    createdProspectId1 = (res.json as jest.Mock).mock.calls[0][0]._id; 

    req = mockRequest({
      method: 'POST',
      body: {
        nom: `Test Prospect ${Date.now() + 1}`,
        email: `test2${Date.now()}@example.com`,
        interets: ['marketing', 'sales'],
        statut: 'Prospect',
      },
    });
    res = mockResponse();
    await handler(req, res);
    createdProspectId2 = (res.json as jest.Mock).mock.calls[0][0]._id; 
  
});

  it('PUT should update an existing prospect', async () => {
    expect(createdProspectId1).toBeDefined();
    const req = mockRequest({
      method: 'PUT',
      query: { id: createdProspectId1 },
      body: {
        nom: 'Updated Prospect',
        interets: ['updated'],
        email: emailId1,
        statut: 'Prospect'
      },
    });
    const res = mockResponse();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('DELETE should remove a prospect', async () => {
    expect(createdProspectId2).toBeDefined();
    const req = mockRequest({
      method: 'DELETE',
      query: { id: createdProspectId2 },
    });
    const res = mockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
  });

  afterAll(async () => {
    const deleteReq1 = mockRequest({ method: 'DELETE', query: { id: createdProspectId1 } });
    const deleteReq2 = mockRequest({ method: 'DELETE', query: { id: createdProspectId2 } });
    const deleteRes = mockResponse();
    await handler(deleteReq1, deleteRes);
    await handler(deleteReq2, deleteRes);
  });
});