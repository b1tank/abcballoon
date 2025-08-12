# get stacks
/stacks:
    get:
      description: |-
        List all stacks based on the current user authorizations.
        Will return all stacks if using an administrator account otherwise it
        will only return the list of stacks the user have access to.
        Limited stacks will not be returned by this endpoint.
        **Access policy**: authenticated
      operationId: StackList
      parameters:
      - description: 'Filters to process on the stack list. Encoded as JSON (a map[string]string).
          For example, {''SwarmID'': ''jpofkc0i9uo9wtx1zesuk649w''} will only return
          stacks that are part of the specified Swarm cluster. Available filters:
          EndpointID, SwarmID.'
        in: query
        name: filters
        type: string
      responses:
        "200":
          description: Success
          schema:
            items:
              $ref: '#/definitions/portainer.Stack'
            type: array
        "204":
          description: Success
        "400":
          description: Invalid request
        "500":
          description: Server error
      security:
      - ApiKeyAuth: []
      - jwt: []
      summary: List stacks
      tags:
      - stacks

# create stack
/stacks/create/standalone/string:
    post:
      consumes:
      - application/json
      description: |-
        Deploy a new stack into a Docker environment specified via the environment identifier.
        **Access policy**: authenticated
      operationId: StackCreateDockerStandaloneString
      parameters:
      - description: stack config
        in: body
        name: body
        required: true
        schema:
          $ref: '#/definitions/stacks.composeStackFromFileContentPayload'
      - description: Identifier of the environment that will be used to deploy the
          stack
        in: query
        name: endpointId
        required: true
        type: integer
      produces:
      - application/json
      responses:
        "200":
          description: OK
          schema:
            $ref: '#/definitions/portainer.Stack'
        "400":
          description: Invalid request
        "500":
          description: Server error
      security:
      - ApiKeyAuth: []
      - jwt: []
      summary: Deploy a new compose stack from a text
      tags:
      - stacks
    
# update stack
put:
      consumes:
      - application/json
      description: |-
        Update a stack, only for file based stacks.
        **Access policy**: authenticated
      operationId: StackUpdate
      parameters:
      - description: Stack identifier
        in: path
        name: id
        required: true
        type: integer
      - description: Environment identifier
        in: query
        name: endpointId
        required: true
        type: integer
      - description: Stack details
        in: body
        name: body
        required: true
        schema:
          $ref: '#/definitions/stacks.updateSwarmStackPayload'
      produces:
      - application/json
      responses:
        "200":
          description: Success
          schema:
            $ref: '#/definitions/portainer.Stack'
        "400":
          description: Invalid request
        "403":
          description: Permission denied
        "404":
          description: Not found
        "500":
          description: Server error
      security:
      - ApiKeyAuth: []
      - jwt: []
      summary: Update a stack
      tags:
      - stacks

# delete stack by name
/stacks/name/{name}:
    delete:
      description: |-
        Remove a stack.
        **Access policy**: restricted
      operationId: StackDeleteKubernetesByName
      parameters:
      - description: Stack name
        in: path
        name: name
        required: true
        type: string
      - description: Set to true to delete an external stack. Only external Swarm
          stacks are supported
        in: query
        name: external
        type: boolean
      - description: Environment identifier
        in: query
        name: endpointId
        required: true
        type: integer
      responses:
        "204":
          description: Success
        "400":
          description: Invalid request
        "403":
          description: Permission denied
        "404":
          description: Not found
        "500":
          description: Server error
      security:
      - ApiKeyAuth: []
      - jwt: []
      summary: Remove Kubernetes stacks by name
      tags:
      - stacks