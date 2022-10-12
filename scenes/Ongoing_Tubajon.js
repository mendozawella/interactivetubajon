// Ongoing_Tubajon.js
var BABYLON;
(function (BABYLON) {
    var InputController = /** @class */ (function () {
        function InputController() {
        }
        /** Configure user input state in the scene. */
        InputController.ConfigureUserInput = function (scene, options) {
            if (options === void 0) { options = null; }
            var pointerLock = (options != null && options.pointerLock) ? options.pointerLock : false;
            var preventDefault = (options != null && options.preventDefault) ? options.preventDefault : false;
            var useCapture = (options != null && options.useCapture) ? options.useCapture : false;
            BABYLON.InputController.resetUserInput();
            if (!BABYLON.InputController.input) {
                // Note: UP Handlers Always On Document Element To Reset DOWN Events No Matter What
                document.documentElement.tabIndex = 1;
                document.documentElement.addEventListener("keyup", BABYLON.InputController.inputKeyUpHandler, useCapture);
                document.documentElement.addEventListener("pointerup", BABYLON.InputController.inputPointerUpHandler, useCapture);
                /* WTF - ???
                scene.onPointerObservable.add((p:BABYLON.PointerInfo)=>{
                    var evt = <BABYLON.IPointerEvent>p.event;
                    if (p.type === PointerEventTypes.POINTERUP) {
                        BABYLON.InputController.inputPointerUpHandler(evt);
                    } else if (p.type === PointerEventTypes.POINTERDOWN) {
                        BABYLON.InputController.inputPointerDownHandler(evt);
                    } else if (p.type === PointerEventTypes.POINTERMOVE) {
                        BABYLON.InputController.inputPointerMoveHandler(evt);
                    }
                });
                */
                if (BABYLON.UserInputOptions.UseCanvasElement === true) {
                    var canvasElement = document.getElementById("renderingCanvas") || scene.getEngine().getRenderingCanvas();
                    canvasElement.tabIndex = 2;
                    canvasElement.addEventListener("focusout", BABYLON.InputController.resetKeyMapHandler, useCapture);
                    canvasElement.addEventListener("keydown", BABYLON.InputController.inputKeyDownHandler, useCapture);
                    canvasElement.addEventListener("pointerdown", BABYLON.InputController.inputPointerDownHandler, useCapture);
                    canvasElement.addEventListener("pointermove", BABYLON.InputController.inputPointerMoveHandler, useCapture);
                    canvasElement.addEventListener("onwheel" in document ? "wheel" : "mousewheel", BABYLON.InputController.inputPointerWheelHandler, useCapture);
                }
                else {
                    document.documentElement.addEventListener("focusout", BABYLON.InputController.resetKeyMapHandler, useCapture);
                    document.documentElement.addEventListener("keydown", BABYLON.InputController.inputKeyDownHandler, useCapture);
                    document.documentElement.addEventListener("pointerdown", BABYLON.InputController.inputPointerDownHandler, useCapture);
                    document.documentElement.addEventListener("pointermove", BABYLON.InputController.inputPointerMoveHandler, useCapture);
                    document.documentElement.addEventListener("onwheel" in document ? "wheel" : "mousewheel", BABYLON.InputController.inputPointerWheelHandler, useCapture);
                }
                BABYLON.InputController.preventDefault = preventDefault;
                // Note: Only Enable Gamepad Manager Once
                if (BABYLON.InputController.GamepadManager == null) {
                    BABYLON.InputController.GamepadManager = new BABYLON.GamepadManager(); // Note: Do Not Use Scene.GameManager Instance
                    BABYLON.InputController.GamepadManager.onGamepadConnectedObservable.add(BABYLON.InputController.inputManagerGamepadConnected);
                    BABYLON.InputController.GamepadManager.onGamepadDisconnectedObservable.add(BABYLON.InputController.inputManagerGamepadDisconnected);
                }
                BABYLON.InputController.input = true;
                document.documentElement.focus();
                if (pointerLock === true)
                    BABYLON.InputController.LockMousePointer(scene, true);
            }
            scene.registerAfterRender(function () { BABYLON.InputController.updateUserInput(scene); });
        };
        InputController.SetLeftJoystickBuffer = function (leftStickX, leftStickY, invertY) {
            if (invertY === void 0) { invertY = true; }
            BABYLON.InputController.j_horizontal = leftStickX;
            BABYLON.InputController.j_vertical = (invertY === true) ? -leftStickY : leftStickY;
        };
        InputController.SetRightJoystickBuffer = function (rightStickX, rightStickY, invertY) {
            if (invertY === void 0) { invertY = true; }
            BABYLON.InputController.j_mousex = rightStickX;
            BABYLON.InputController.j_mousey = (invertY === true) ? -rightStickY : rightStickY;
        };
        /** Disables user input state in the scene. */
        InputController.DisableUserInput = function (scene, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
            BABYLON.InputController.LockMousePointer(scene, false);
            // DUNNO: scene.unregisterAfterRender(() => { BABYLON.InputController.updateUserInput(scene); });  // Unregister Anonymous Handler - ???
            BABYLON.InputController.resetUserInput();
        };
        // ************************************* //
        // *  Scene Screen Input Lock Support  * //
        // ************************************* //
        /** Locks user pointer state in the scene. */
        InputController.LockMousePointer = function (scene, lock) {
            if (lock === true) {
                BABYLON.InputController.LockMousePointerObserver = scene.onPointerObservable.add(function (eventData, eventState) {
                    if (eventData.type == BABYLON.PointerEventTypes.POINTERDOWN) {
                        if (!document.pointerLockElement) {
                            scene.getEngine().enterPointerlock();
                        }
                    }
                });
            }
            else {
                if (BABYLON.InputController.IsPointerLockHandled()) {
                    scene.onPointerObservable.remove(BABYLON.InputController.LockMousePointerObserver);
                    BABYLON.InputController.LockMousePointerObserver = null;
                }
            }
        };
        InputController.IsPointerLocked = function () { return BABYLON.InputController.PointerLockedFlag; };
        InputController.IsPointerLockHandled = function () { return (BABYLON.InputController.LockMousePointerObserver != null); };
        // ********************************** //
        // *  Scene Get User Input Support  * //
        // ********************************** //
        /** Get user input state from the scene. */
        InputController.GetUserInput = function (input, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var result = 0;
            if (BABYLON.InputController.input) {
                switch (input) {
                    case BABYLON.UserInputAxis.Vertical:
                    case BABYLON.UserInputAxis.Horizontal:
                        if (player === BABYLON.PlayerNumber.Four) {
                            result = (input === BABYLON.UserInputAxis.Horizontal) ? BABYLON.InputController.horizontal4 : BABYLON.InputController.vertical4;
                        }
                        else if (player === BABYLON.PlayerNumber.Three) {
                            result = (input === BABYLON.UserInputAxis.Horizontal) ? BABYLON.InputController.horizontal3 : BABYLON.InputController.vertical3;
                        }
                        else if (player === BABYLON.PlayerNumber.Two) {
                            result = (input === BABYLON.UserInputAxis.Horizontal) ? BABYLON.InputController.horizontal2 : BABYLON.InputController.vertical2;
                        }
                        else {
                            result = (input === BABYLON.UserInputAxis.Horizontal) ? BABYLON.InputController.horizontal : BABYLON.InputController.vertical;
                        }
                        break;
                    case BABYLON.UserInputAxis.MouseX:
                    case BABYLON.UserInputAxis.MouseY:
                        if (player === BABYLON.PlayerNumber.Four) {
                            result = (input === BABYLON.UserInputAxis.MouseX) ? BABYLON.InputController.mousex4 : BABYLON.InputController.mousey4;
                        }
                        else if (player === BABYLON.PlayerNumber.Three) {
                            result = (input === BABYLON.UserInputAxis.MouseX) ? BABYLON.InputController.mousex3 : BABYLON.InputController.mousey3;
                        }
                        else if (player === BABYLON.PlayerNumber.Two) {
                            result = (input === BABYLON.UserInputAxis.MouseX) ? BABYLON.InputController.mousex2 : BABYLON.InputController.mousey2;
                        }
                        else {
                            result = (input === BABYLON.UserInputAxis.MouseX) ? BABYLON.InputController.mousex : BABYLON.InputController.mousey;
                        }
                        break;
                    case BABYLON.UserInputAxis.Wheel:
                        if (player === BABYLON.PlayerNumber.One) {
                            result = BABYLON.InputController.wheel;
                        }
                        break;
                }
            }
            return result;
        };
        // ********************************* //
        // *  Scene Keycode State Support  * //
        // ********************************* //
        /** Set a keyboard up event handler. */
        InputController.OnKeyboardUp = function (callback) {
            if (BABYLON.InputController.input)
                BABYLON.InputController.keyButtonUp.push(callback);
        };
        /** Set a keyboard down event handler. */
        InputController.OnKeyboardDown = function (callback) {
            if (BABYLON.InputController.input)
                BABYLON.InputController.keyButtonDown.push(callback);
        };
        /** Set a keyboard press event handler. */
        InputController.OnKeyboardPress = function (keycode, callback) {
            if (BABYLON.InputController.input)
                BABYLON.InputController.keyButtonPress.push({ index: keycode, action: callback });
        };
        /** Get the specified keyboard input by keycode. */
        InputController.GetKeyboardInput = function (keycode) {
            var result = false;
            if (BABYLON.InputController.input) {
                var key = "k:" + keycode.toString();
                if (BABYLON.InputController.keymap[key] != null) {
                    result = BABYLON.InputController.keymap[key];
                }
            }
            return result;
        };
        // ********************************* //
        // *   Scene Mouse State Support   * //
        // ********************************* //
        /** Set a pointer up event handler. */
        InputController.OnPointerUp = function (callback) {
            if (BABYLON.InputController.input)
                BABYLON.InputController.mouseButtonUp.push(callback);
        };
        /** Set a pointer down event handler. */
        InputController.OnPointerDown = function (callback) {
            if (BABYLON.InputController.input)
                BABYLON.InputController.mouseButtonDown.push(callback);
        };
        /** Set a pointer press event handler. */
        InputController.OnPointerPress = function (button, callback) {
            if (BABYLON.InputController.input)
                BABYLON.InputController.mouseButtonPress.push({ index: button, action: callback });
        };
        /** Get the specified pointer input by button. */
        InputController.GetPointerInput = function (button) {
            var result = false;
            if (BABYLON.InputController.input) {
                var key = "p:" + button.toString();
                if (BABYLON.InputController.keymap[key] != null) {
                    result = BABYLON.InputController.keymap[key];
                }
            }
            return result;
        };
        // ********************************* //
        // *  Scene Gamepad State Support  * //
        // ********************************* //
        /** Set on gamepad button up event handler. */
        InputController.OnGamepadButtonUp = function (callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1ButtonUp.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2ButtonUp.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3ButtonUp.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4ButtonUp.push(callback);
                        break;
                }
            }
        };
        /** Set on gamepad button down event handler. */
        InputController.OnGamepadButtonDown = function (callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1ButtonDown.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2ButtonDown.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3ButtonDown.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4ButtonDown.push(callback);
                        break;
                }
            }
        };
        /** Set on gamepad button press event handler. */
        InputController.OnGamepadButtonPress = function (button, callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1ButtonPress.push({ index: button, action: callback });
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2ButtonPress.push({ index: button, action: callback });
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3ButtonPress.push({ index: button, action: callback });
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4ButtonPress.push({ index: button, action: callback });
                        break;
                }
            }
        };
        /** Get the specified gamepad input by button. */
        InputController.GetGamepadButtonInput = function (button, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var result = false;
            if (BABYLON.InputController.input) {
                var key = null;
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        key = "b1:" + button.toString();
                        break;
                    case BABYLON.PlayerNumber.Two:
                        key = "b2:" + button.toString();
                        break;
                    case BABYLON.PlayerNumber.Three:
                        key = "b3:" + button.toString();
                        break;
                    case BABYLON.PlayerNumber.Four:
                        key = "b4:" + button.toString();
                        break;
                }
                if (key != null && BABYLON.InputController.keymap[key] != null) {
                    result = BABYLON.InputController.keymap[key];
                }
            }
            return result;
        };
        /** Set on gamepad direction pad up event handler. */
        InputController.OnGamepadDirectionUp = function (callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1DpadUp.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2DpadUp.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3DpadUp.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4DpadUp.push(callback);
                        break;
                }
            }
        };
        /** Set on gamepad direction pad down event handler. */
        InputController.OnGamepadDirectionDown = function (callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1DpadDown.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2DpadDown.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3DpadDown.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4DpadDown.push(callback);
                        break;
                }
            }
        };
        /** Set on gamepad direction pad press event handler. */
        InputController.OnGamepadDirectionPress = function (direction, callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1DpadPress.push({ index: direction, action: callback });
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2DpadPress.push({ index: direction, action: callback });
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3DpadPress.push({ index: direction, action: callback });
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4DpadPress.push({ index: direction, action: callback });
                        break;
                }
            }
        };
        /** Get the specified gamepad direction input by number. */
        InputController.GetGamepadDirectionInput = function (direction, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var result = false;
            if (BABYLON.InputController.input) {
                var key = null;
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        key = "d1:" + direction.toString();
                        break;
                    case BABYLON.PlayerNumber.Two:
                        key = "d2:" + direction.toString();
                        break;
                    case BABYLON.PlayerNumber.Three:
                        key = "d3:" + direction.toString();
                        break;
                    case BABYLON.PlayerNumber.Four:
                        key = "d4:" + direction.toString();
                        break;
                }
                if (key != null && BABYLON.InputController.keymap[key] != null) {
                    result = BABYLON.InputController.keymap[key];
                }
            }
            return result;
        };
        /** Set on gamepad trigger left event handler. */
        InputController.OnGamepadTriggerLeft = function (callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1LeftTrigger.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2LeftTrigger.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3LeftTrigger.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4LeftTrigger.push(callback);
                        break;
                }
            }
        };
        /** Set on gamepad trigger right event handler. */
        InputController.OnGamepadTriggerRight = function (callback, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        BABYLON.InputController.gamepad1RightTrigger.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Two:
                        BABYLON.InputController.gamepad2RightTrigger.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Three:
                        BABYLON.InputController.gamepad3RightTrigger.push(callback);
                        break;
                    case BABYLON.PlayerNumber.Four:
                        BABYLON.InputController.gamepad4RightTrigger.push(callback);
                        break;
                }
            }
        };
        /** Get the specified gamepad trigger input by number. */
        InputController.GetGamepadTriggerInput = function (trigger, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var result = 0;
            if (BABYLON.InputController.input) {
                var key = null;
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        key = "t1:" + trigger.toString();
                        break;
                    case BABYLON.PlayerNumber.Two:
                        key = "t2:" + trigger.toString();
                        break;
                    case BABYLON.PlayerNumber.Three:
                        key = "t3:" + trigger.toString();
                        break;
                    case BABYLON.PlayerNumber.Four:
                        key = "t4:" + trigger.toString();
                        break;
                }
                if (key != null && BABYLON.InputController.keymap[key] != null) {
                    result = BABYLON.InputController.keymap[key];
                }
            }
            return result;
        };
        /** Get the specified gamepad type. */
        InputController.GetGamepadType = function (player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var type = BABYLON.GamepadType.None;
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        type = BABYLON.InputController.gamepad1Type;
                        break;
                    case BABYLON.PlayerNumber.Two:
                        type = BABYLON.InputController.gamepad2Type;
                        break;
                    case BABYLON.PlayerNumber.Three:
                        type = BABYLON.InputController.gamepad3Type;
                        break;
                    case BABYLON.PlayerNumber.Four:
                        type = BABYLON.InputController.gamepad4Type;
                        break;
                }
            }
            return type;
        };
        /** Get the specified gamepad. */
        InputController.GetGamepad = function (player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var pad = null;
            if (BABYLON.InputController.input) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        pad = BABYLON.InputController.gamepad1;
                        break;
                    case BABYLON.PlayerNumber.Two:
                        pad = BABYLON.InputController.gamepad2;
                        break;
                    case BABYLON.PlayerNumber.Three:
                        pad = BABYLON.InputController.gamepad3;
                        break;
                    case BABYLON.PlayerNumber.Four:
                        pad = BABYLON.InputController.gamepad4;
                        break;
                }
            }
            return pad;
        };
        InputController.tickKeyboardInput = function (scene) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            var forward = BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.W) || BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.UpArrow);
            var left = BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.A);
            var back = BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.S) || BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.DownArrow);
            var right = BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.D);
            var aleft = BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.LeftArrow);
            var aright = BABYLON.InputController.GetKeyboardInput(BABYLON.UserInputKey.RightArrow);
            // ..
            if (forward === true) {
                BABYLON.InputController.k_vertical = BABYLON.Utilities.GetKeyboardInputValue(scene, BABYLON.InputController.k_vertical, 1);
            }
            else if (back === true) {
                BABYLON.InputController.k_vertical = BABYLON.Utilities.GetKeyboardInputValue(scene, BABYLON.InputController.k_vertical, -1);
            }
            else {
                BABYLON.InputController.k_vertical = 0;
            }
            // ..
            if (BABYLON.UserInputOptions.UseArrowKeyRotation === true) {
                if (right === true) {
                    BABYLON.InputController.k_horizontal = BABYLON.Utilities.GetKeyboardInputValue(scene, BABYLON.InputController.k_horizontal, 1);
                }
                else if (left === true) {
                    BABYLON.InputController.k_horizontal = BABYLON.Utilities.GetKeyboardInputValue(scene, BABYLON.InputController.k_horizontal, -1);
                }
                else {
                    BABYLON.InputController.k_horizontal = 0;
                }
                if (aright === true) {
                    BABYLON.InputController.a_mousex = 1; // FIXME - Smooth Mouse Array - ???
                }
                else if (aleft === true) {
                    BABYLON.InputController.a_mousex = -1; // FIXME - Smooth Mouse Array - ???
                }
                else {
                    BABYLON.InputController.a_mousex = 0;
                }
            }
            else {
                if (right === true || aright === true) {
                    BABYLON.InputController.k_horizontal = BABYLON.Utilities.GetKeyboardInputValue(scene, BABYLON.InputController.k_horizontal, 1);
                }
                else if (left === true || aleft === true) {
                    BABYLON.InputController.k_horizontal = BABYLON.Utilities.GetKeyboardInputValue(scene, BABYLON.InputController.k_horizontal, -1);
                }
                else {
                    BABYLON.InputController.k_horizontal = 0;
                }
            }
        };
        InputController.updateUserInput = function (scene) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            BABYLON.InputController.PointerLockedFlag = scene.getEngine().isPointerLock;
            BABYLON.InputController.tickKeyboardInput(scene);
            // Reset global user input state  buffers
            BABYLON.InputController.x_horizontal = 0;
            BABYLON.InputController.x_vertical = 0;
            BABYLON.InputController.x_mousex = 0;
            BABYLON.InputController.x_mousey = 0;
            // Update user input state by order of precedence
            if (BABYLON.InputController.j_horizontal !== 0) {
                BABYLON.InputController.x_horizontal = BABYLON.InputController.j_horizontal;
            }
            else if (BABYLON.InputController.g_horizontal1 !== 0) {
                BABYLON.InputController.x_horizontal = BABYLON.InputController.g_horizontal1;
            }
            else if (BABYLON.InputController.k_horizontal !== 0) {
                BABYLON.InputController.x_horizontal = BABYLON.InputController.k_horizontal;
            }
            if (BABYLON.InputController.j_vertical !== 0) {
                BABYLON.InputController.x_vertical = BABYLON.InputController.j_vertical;
            }
            else if (BABYLON.InputController.g_vertical1 !== 0) {
                BABYLON.InputController.x_vertical = BABYLON.InputController.g_vertical1;
            }
            else if (BABYLON.InputController.k_vertical !== 0) {
                BABYLON.InputController.x_vertical = BABYLON.InputController.k_vertical;
            }
            if (BABYLON.InputController.j_mousex !== 0) {
                BABYLON.InputController.x_mousex = BABYLON.InputController.j_mousex;
            }
            else if (BABYLON.InputController.g_mousex1 !== 0) {
                BABYLON.InputController.x_mousex = BABYLON.InputController.g_mousex1;
            }
            else if (BABYLON.InputController.a_mousex !== 0) {
                BABYLON.InputController.x_mousex = BABYLON.InputController.a_mousex;
            }
            else if (BABYLON.InputController.k_mousex !== 0) {
                BABYLON.InputController.x_mousex = BABYLON.InputController.k_mousex;
            }
            if (BABYLON.InputController.j_mousey !== 0) {
                BABYLON.InputController.x_mousey = BABYLON.InputController.j_mousey;
            }
            else if (BABYLON.InputController.g_mousey1 !== 0) {
                BABYLON.InputController.x_mousey = BABYLON.InputController.g_mousey1;
            }
            else if (BABYLON.InputController.k_mousey !== 0) {
                BABYLON.InputController.x_mousey = BABYLON.InputController.k_mousey;
            }
            // Update global user input state buffers
            BABYLON.InputController.horizontal = BABYLON.InputController.x_horizontal;
            BABYLON.InputController.vertical = BABYLON.InputController.x_vertical;
            BABYLON.InputController.mousex = BABYLON.InputController.x_mousex;
            BABYLON.InputController.mousey = BABYLON.InputController.x_mousey;
            BABYLON.InputController.wheel = BABYLON.InputController.x_wheel;
            // Update gamepad two user input 
            BABYLON.InputController.horizontal2 = BABYLON.InputController.g_horizontal2;
            BABYLON.InputController.vertical2 = BABYLON.InputController.g_vertical2;
            BABYLON.InputController.mousex2 = BABYLON.InputController.g_mousex2;
            BABYLON.InputController.mousey2 = BABYLON.InputController.g_mousey2;
            // Update gamepad three user input 
            BABYLON.InputController.horizontal3 = BABYLON.InputController.g_horizontal3;
            BABYLON.InputController.vertical3 = BABYLON.InputController.g_vertical3;
            BABYLON.InputController.mousex3 = BABYLON.InputController.g_mousex3;
            BABYLON.InputController.mousey3 = BABYLON.InputController.g_mousey3;
            // Update gamepad four user input 
            BABYLON.InputController.horizontal4 = BABYLON.InputController.g_horizontal4;
            BABYLON.InputController.vertical4 = BABYLON.InputController.g_vertical4;
            BABYLON.InputController.mousex4 = BABYLON.InputController.g_mousex4;
            BABYLON.InputController.mousey4 = BABYLON.InputController.g_mousey4;
            // Reset mouse wheel user input buffer
            BABYLON.InputController.k_mousex = 0;
            BABYLON.InputController.k_mousey = 0;
            BABYLON.InputController.x_mousey = 0;
        };
        InputController.resetUserInput = function () {
            BABYLON.InputController.input = false;
            BABYLON.InputController.keymap = {};
            BABYLON.InputController.wheel = 0;
            BABYLON.InputController.mousex = 0;
            BABYLON.InputController.mousey = 0;
            BABYLON.InputController.vertical = 0;
            BABYLON.InputController.horizontal = 0;
            BABYLON.InputController.mousex2 = 0;
            BABYLON.InputController.mousey2 = 0;
            BABYLON.InputController.vertical2 = 0;
            BABYLON.InputController.horizontal2 = 0;
            BABYLON.InputController.mousex3 = 0;
            BABYLON.InputController.mousey3 = 0;
            BABYLON.InputController.vertical3 = 0;
            BABYLON.InputController.horizontal3 = 0;
            BABYLON.InputController.mousex4 = 0;
            BABYLON.InputController.mousey4 = 0;
            BABYLON.InputController.vertical4 = 0;
            BABYLON.InputController.horizontal4 = 0;
            BABYLON.InputController.a_mousex = 0;
            BABYLON.InputController.x_wheel = 0;
            BABYLON.InputController.x_mousex = 0;
            BABYLON.InputController.x_mousey = 0;
            BABYLON.InputController.x_vertical = 0;
            BABYLON.InputController.x_horizontal = 0;
            BABYLON.InputController.k_mousex = 0;
            BABYLON.InputController.k_mousey = 0;
            BABYLON.InputController.k_vertical = 0;
            BABYLON.InputController.k_horizontal = 0;
            BABYLON.InputController.j_mousex = 0;
            BABYLON.InputController.j_mousey = 0;
            BABYLON.InputController.j_vertical = 0;
            BABYLON.InputController.j_horizontal = 0;
            BABYLON.InputController.g_mousex1 = 0;
            BABYLON.InputController.g_mousey1 = 0;
            BABYLON.InputController.g_vertical1 = 0;
            BABYLON.InputController.g_horizontal1 = 0;
            BABYLON.InputController.g_mousex2 = 0;
            BABYLON.InputController.g_mousey2 = 0;
            BABYLON.InputController.g_vertical2 = 0;
            BABYLON.InputController.g_horizontal2 = 0;
            BABYLON.InputController.g_mousex3 = 0;
            BABYLON.InputController.g_mousey3 = 0;
            BABYLON.InputController.g_vertical3 = 0;
            BABYLON.InputController.g_horizontal3 = 0;
            BABYLON.InputController.g_mousex4 = 0;
            BABYLON.InputController.g_mousey4 = 0;
            BABYLON.InputController.g_vertical4 = 0;
            BABYLON.InputController.g_horizontal4 = 0;
            BABYLON.InputController.preventDefault = false;
            BABYLON.InputController.mouseButtonUp = [];
            BABYLON.InputController.mouseButtonDown = [];
            BABYLON.InputController.mouseButtonPress = [];
            BABYLON.InputController.keyButtonUp = [];
            BABYLON.InputController.keyButtonDown = [];
            BABYLON.InputController.keyButtonPress = [];
            BABYLON.InputController.gamepad1ButtonUp = [];
            BABYLON.InputController.gamepad1ButtonDown = [];
            BABYLON.InputController.gamepad1ButtonPress = [];
            BABYLON.InputController.gamepad1DpadUp = [];
            BABYLON.InputController.gamepad1DpadDown = [];
            BABYLON.InputController.gamepad1DpadPress = [];
            BABYLON.InputController.gamepad1LeftTrigger = [];
            BABYLON.InputController.gamepad1RightTrigger = [];
            BABYLON.InputController.gamepad2ButtonUp = [];
            BABYLON.InputController.gamepad2ButtonDown = [];
            BABYLON.InputController.gamepad2ButtonPress = [];
            BABYLON.InputController.gamepad2DpadUp = [];
            BABYLON.InputController.gamepad2DpadDown = [];
            BABYLON.InputController.gamepad2DpadPress = [];
            BABYLON.InputController.gamepad2LeftTrigger = [];
            BABYLON.InputController.gamepad2RightTrigger = [];
            BABYLON.InputController.gamepad3ButtonUp = [];
            BABYLON.InputController.gamepad3ButtonDown = [];
            BABYLON.InputController.gamepad3ButtonPress = [];
            BABYLON.InputController.gamepad3DpadUp = [];
            BABYLON.InputController.gamepad3DpadDown = [];
            BABYLON.InputController.gamepad3DpadPress = [];
            BABYLON.InputController.gamepad3LeftTrigger = [];
            BABYLON.InputController.gamepad3RightTrigger = [];
            BABYLON.InputController.gamepad4ButtonUp = [];
            BABYLON.InputController.gamepad4ButtonDown = [];
            BABYLON.InputController.gamepad4ButtonPress = [];
            BABYLON.InputController.gamepad4DpadUp = [];
            BABYLON.InputController.gamepad4DpadDown = [];
            BABYLON.InputController.gamepad4DpadPress = [];
            BABYLON.InputController.gamepad4LeftTrigger = [];
            BABYLON.InputController.gamepad4RightTrigger = [];
            BABYLON.InputController.previousPosition = null;
        };
        InputController.resetKeyMapHandler = function (e) {
            BABYLON.InputController.keymap = {};
        };
        InputController.inputKeyDownHandler = function (e) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return false;
            var key = "k:" + e.keyCode.toString();
            var pressed = false;
            if (BABYLON.InputController.keymap[key] != null) {
                pressed = BABYLON.InputController.keymap[key];
            }
            BABYLON.InputController.keymap[key] = true;
            if (BABYLON.InputController.keyButtonDown != null && BABYLON.InputController.keyButtonDown.length > 0) {
                BABYLON.InputController.keyButtonDown.forEach(function (callback) {
                    callback(e.keyCode);
                });
            }
            if (!pressed) {
                if (BABYLON.InputController.keyButtonPress != null && BABYLON.InputController.keyButtonPress.length > 0) {
                    BABYLON.InputController.keyButtonPress.forEach(function (press) {
                        if (press.index === e.keyCode) {
                            press.action();
                        }
                    });
                }
            }
            if (BABYLON.InputController.preventDefault)
                e.preventDefault();
            return true;
        };
        InputController.inputKeyUpHandler = function (e) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return false;
            var key = "k:" + e.keyCode.toString();
            BABYLON.InputController.keymap[key] = false;
            if (BABYLON.InputController.keyButtonUp != null && BABYLON.InputController.keyButtonUp.length > 0) {
                BABYLON.InputController.keyButtonUp.forEach(function (callback) {
                    callback(e.keyCode);
                });
            }
            if (BABYLON.InputController.preventDefault)
                e.preventDefault();
            return true;
        };
        InputController.inputPointerWheelHandler = function (e) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return false;
            var delta = e.deltaY ? -e.deltaY : e.wheelDelta / 40;
            BABYLON.InputController.x_wheel = Math.abs(delta) > BABYLON.UserInputOptions.PointerWheelDeadZone ? 0 + delta : 0;
            if (BABYLON.InputController.preventDefault)
                e.preventDefault();
            return true;
        };
        InputController.inputPointerDownHandler = function (e) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return false;
            BABYLON.InputController.previousPosition = {
                x: e.clientX,
                y: e.clientY
            };
            // ..
            var key = "p:" + e.button.toString();
            var pressed = false;
            if (BABYLON.InputController.keymap[key] != null) {
                pressed = BABYLON.InputController.keymap[key];
            }
            BABYLON.InputController.keymap[key] = true;
            if (BABYLON.InputController.mouseButtonDown != null && BABYLON.InputController.mouseButtonDown.length > 0) {
                BABYLON.InputController.mouseButtonDown.forEach(function (callback) {
                    callback(e.button);
                });
            }
            if (!pressed) {
                if (BABYLON.InputController.mouseButtonPress != null && BABYLON.InputController.mouseButtonPress.length > 0) {
                    BABYLON.InputController.mouseButtonPress.forEach(function (press) {
                        if (press.index === e.button) {
                            press.action();
                        }
                    });
                }
            }
            // ..
            if (BABYLON.InputController.preventDefault)
                e.preventDefault();
            return true;
        };
        InputController.inputPointerUpHandler = function (e) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return false;
            BABYLON.InputController.previousPosition = null;
            BABYLON.InputController.k_mousex = 0;
            BABYLON.InputController.k_mousey = 0;
            // ..
            var key = "p:" + e.button.toString();
            BABYLON.InputController.keymap[key] = false;
            if (BABYLON.InputController.mouseButtonUp != null && BABYLON.InputController.mouseButtonUp.length > 0) {
                BABYLON.InputController.mouseButtonUp.forEach(function (callback) {
                    callback(e.button);
                });
            }
            // ..
            if (BABYLON.InputController.preventDefault)
                e.preventDefault();
            return true;
        };
        InputController.inputPointerMoveHandler = function (e) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return false;
            // NOTE: Mouse Pointer Rotation When No Virtual Joystick Enabled
            if (BABYLON.SceneManager.VirtualJoystickEnabled === false) {
                var offsetX = 0;
                var offsetY = 0;
                if (BABYLON.InputController.IsPointerLocked()) {
                    offsetX = e.movementX || e.mozMovementX || e.webkitMovementX || e.msMovementX || 0;
                    offsetY = e.movementY || e.mozMovementY || e.webkitMovementY || e.msMovementY || 0;
                    BABYLON.InputController.previousPosition = null;
                }
                else if (BABYLON.InputController.previousPosition != null) {
                    offsetX = e.clientX - BABYLON.InputController.previousPosition.x;
                    offsetY = e.clientY - BABYLON.InputController.previousPosition.y;
                    BABYLON.InputController.previousPosition = {
                        x: e.clientX,
                        y: e.clientY
                    };
                }
                //..
                if (BABYLON.UserInputOptions.PointerMouseInverted === true) {
                    offsetX *= -1;
                    offsetY *= -1;
                }
                if (BABYLON.InputController.rightHanded)
                    offsetX *= -1;
                var mousex = (offsetX * BABYLON.UserInputOptions.PointerAngularSensibility * 0.1);
                var mousey = (offsetY * BABYLON.UserInputOptions.PointerAngularSensibility * 0.1);
                if (Math.abs(offsetX) <= BABYLON.UserInputOptions.PointerMouseDeadZone)
                    mousex = 0;
                if (Math.abs(offsetY) <= BABYLON.UserInputOptions.PointerMouseDeadZone)
                    mousey = 0;
                BABYLON.InputController.k_mousex += mousex;
                BABYLON.InputController.k_mousey += mousey;
            }
            if (BABYLON.InputController.preventDefault)
                e.preventDefault();
            return true;
        };
        InputController.inputOneButtonDownHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var key = "b1:" + button.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad1ButtonDown != null && BABYLON.InputController.gamepad1ButtonDown.length > 0) {
                    BABYLON.InputController.gamepad1ButtonDown.forEach(function (callback) {
                        callback(button);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad1ButtonPress != null && BABYLON.InputController.gamepad1ButtonPress.length > 0) {
                        BABYLON.InputController.gamepad1ButtonPress.forEach(function (press) {
                            if (press.index === button) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputOneButtonUpHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var key = "b1:" + button.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad1ButtonUp != null && BABYLON.InputController.gamepad1ButtonUp.length > 0) {
                    BABYLON.InputController.gamepad1ButtonUp.forEach(function (callback) {
                        callback(button);
                    });
                }
            }
        };
        InputController.inputOneXboxDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var key = "d1:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad1DpadDown != null && BABYLON.InputController.gamepad1DpadDown.length > 0) {
                    BABYLON.InputController.gamepad1DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad1DpadPress != null && BABYLON.InputController.gamepad1DpadPress.length > 0) {
                        BABYLON.InputController.gamepad1DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputOneShockDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var key = "d1:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad1DpadDown != null && BABYLON.InputController.gamepad1DpadDown.length > 0) {
                    BABYLON.InputController.gamepad1DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad1DpadPress != null && BABYLON.InputController.gamepad1DpadPress.length > 0) {
                        BABYLON.InputController.gamepad1DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputOneXboxDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var key = "d1:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad1DpadUp != null && BABYLON.InputController.gamepad1DpadUp.length > 0) {
                    BABYLON.InputController.gamepad1DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputOneShockDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var key = "d1:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad1DpadUp != null && BABYLON.InputController.gamepad1DpadUp.length > 0) {
                    BABYLON.InputController.gamepad1DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputOneXboxLeftTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                BABYLON.InputController.keymap["t1:0"] = value;
                if (BABYLON.InputController.gamepad1LeftTrigger != null && BABYLON.InputController.gamepad1LeftTrigger.length > 0) {
                    BABYLON.InputController.gamepad1LeftTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputOneXboxRightTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                BABYLON.InputController.keymap["t1:1"] = value;
                if (BABYLON.InputController.gamepad1RightTrigger != null && BABYLON.InputController.gamepad1RightTrigger.length > 0) {
                    BABYLON.InputController.gamepad1RightTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputOneLeftStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var LSValues = values;
                var normalizedLX = LSValues.x * BABYLON.UserInputOptions.GamepadLStickSensibility;
                var normalizedLY = LSValues.y * BABYLON.UserInputOptions.GamepadLStickSensibility;
                LSValues.x = Math.abs(normalizedLX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
                LSValues.y = Math.abs(normalizedLY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
                BABYLON.InputController.g_horizontal1 = (BABYLON.UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
                BABYLON.InputController.g_vertical1 = (BABYLON.UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
            }
        };
        InputController.inputOneRightStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad1 != null) {
                var RSValues = values;
                var normalizedRX = RSValues.x * BABYLON.UserInputOptions.GamepadRStickSensibility;
                var normalizedRY = RSValues.y * BABYLON.UserInputOptions.GamepadRStickSensibility;
                RSValues.x = Math.abs(normalizedRX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
                RSValues.y = Math.abs(normalizedRY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
                BABYLON.InputController.g_mousex1 = (BABYLON.UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
                BABYLON.InputController.g_mousey1 = (BABYLON.UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
            }
        };
        InputController.inputTwoButtonDownHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var key = "b2:" + button.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad2ButtonDown != null && BABYLON.InputController.gamepad2ButtonDown.length > 0) {
                    BABYLON.InputController.gamepad2ButtonDown.forEach(function (callback) {
                        callback(button);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad2ButtonPress != null && BABYLON.InputController.gamepad2ButtonPress.length > 0) {
                        BABYLON.InputController.gamepad2ButtonPress.forEach(function (press) {
                            if (press.index === button) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputTwoButtonUpHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var key = "b2:" + button.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad2ButtonUp != null && BABYLON.InputController.gamepad2ButtonUp.length > 0) {
                    BABYLON.InputController.gamepad2ButtonUp.forEach(function (callback) {
                        callback(button);
                    });
                }
            }
        };
        InputController.inputTwoXboxDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var key = "d2:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad2DpadDown != null && BABYLON.InputController.gamepad2DpadDown.length > 0) {
                    BABYLON.InputController.gamepad2DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad2DpadPress != null && BABYLON.InputController.gamepad2DpadPress.length > 0) {
                        BABYLON.InputController.gamepad2DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputTwoShockDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var key = "d2:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad2DpadDown != null && BABYLON.InputController.gamepad2DpadDown.length > 0) {
                    BABYLON.InputController.gamepad2DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad2DpadPress != null && BABYLON.InputController.gamepad2DpadPress.length > 0) {
                        BABYLON.InputController.gamepad2DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputTwoXboxDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var key = "d2:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad2DpadUp != null && BABYLON.InputController.gamepad2DpadUp.length > 0) {
                    BABYLON.InputController.gamepad2DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputTwoShockDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var key = "d2:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad2DpadUp != null && BABYLON.InputController.gamepad2DpadUp.length > 0) {
                    BABYLON.InputController.gamepad2DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputTwoXboxLeftTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                BABYLON.InputController.keymap["t2:0"] = value;
                if (BABYLON.InputController.gamepad2LeftTrigger != null && BABYLON.InputController.gamepad2LeftTrigger.length > 0) {
                    BABYLON.InputController.gamepad2LeftTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputTwoXboxRightTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                BABYLON.InputController.keymap["t2:1"] = value;
                if (BABYLON.InputController.gamepad2RightTrigger != null && BABYLON.InputController.gamepad2RightTrigger.length > 0) {
                    BABYLON.InputController.gamepad2RightTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputTwoLeftStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var LSValues = values;
                var normalizedLX = LSValues.x * BABYLON.UserInputOptions.GamepadLStickSensibility;
                var normalizedLY = LSValues.y * BABYLON.UserInputOptions.GamepadLStickSensibility;
                LSValues.x = Math.abs(normalizedLX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
                LSValues.y = Math.abs(normalizedLY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
                BABYLON.InputController.g_horizontal2 = (BABYLON.UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
                BABYLON.InputController.g_vertical2 = (BABYLON.UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
            }
        };
        InputController.inputTwoRightStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad2 != null) {
                var RSValues = values;
                var normalizedRX = RSValues.x * BABYLON.UserInputOptions.GamepadRStickSensibility;
                var normalizedRY = RSValues.y * BABYLON.UserInputOptions.GamepadRStickSensibility;
                RSValues.x = Math.abs(normalizedRX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
                RSValues.y = Math.abs(normalizedRY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
                BABYLON.InputController.g_mousex2 = (BABYLON.UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
                BABYLON.InputController.g_mousey2 = (BABYLON.UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
            }
        };
        InputController.inputThreeButtonDownHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var key = "b3:" + button.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad3ButtonDown != null && BABYLON.InputController.gamepad3ButtonDown.length > 0) {
                    BABYLON.InputController.gamepad3ButtonDown.forEach(function (callback) {
                        callback(button);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad3ButtonPress != null && BABYLON.InputController.gamepad3ButtonPress.length > 0) {
                        BABYLON.InputController.gamepad3ButtonPress.forEach(function (press) {
                            if (press.index === button) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputThreeButtonUpHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var key = "b3:" + button.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad3ButtonUp != null && BABYLON.InputController.gamepad3ButtonUp.length > 0) {
                    BABYLON.InputController.gamepad3ButtonUp.forEach(function (callback) {
                        callback(button);
                    });
                }
            }
        };
        InputController.inputThreeXboxDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var key = "d3:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad3DpadDown != null && BABYLON.InputController.gamepad3DpadDown.length > 0) {
                    BABYLON.InputController.gamepad3DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad3DpadPress != null && BABYLON.InputController.gamepad3DpadPress.length > 0) {
                        BABYLON.InputController.gamepad3DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputThreeShockDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var key = "d3:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad3DpadDown != null && BABYLON.InputController.gamepad3DpadDown.length > 0) {
                    BABYLON.InputController.gamepad3DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad3DpadPress != null && BABYLON.InputController.gamepad3DpadPress.length > 0) {
                        BABYLON.InputController.gamepad3DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputThreeXboxDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var key = "d3:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad3DpadUp != null && BABYLON.InputController.gamepad3DpadUp.length > 0) {
                    BABYLON.InputController.gamepad3DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputThreeShockDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var key = "d3:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad3DpadUp != null && BABYLON.InputController.gamepad3DpadUp.length > 0) {
                    BABYLON.InputController.gamepad3DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputThreeXboxLeftTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                BABYLON.InputController.keymap["t3:0"] = value;
                if (BABYLON.InputController.gamepad3LeftTrigger != null && BABYLON.InputController.gamepad3LeftTrigger.length > 0) {
                    BABYLON.InputController.gamepad3LeftTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputThreeXboxRightTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                BABYLON.InputController.keymap["t3:1"] = value;
                if (BABYLON.InputController.gamepad3RightTrigger != null && BABYLON.InputController.gamepad3RightTrigger.length > 0) {
                    BABYLON.InputController.gamepad3RightTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputThreeLeftStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var LSValues = values;
                var normalizedLX = LSValues.x * BABYLON.UserInputOptions.GamepadLStickSensibility;
                var normalizedLY = LSValues.y * BABYLON.UserInputOptions.GamepadLStickSensibility;
                LSValues.x = Math.abs(normalizedLX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
                LSValues.y = Math.abs(normalizedLY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
                BABYLON.InputController.g_horizontal3 = (BABYLON.UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
                BABYLON.InputController.g_vertical3 = (BABYLON.UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
            }
        };
        InputController.inputThreeRightStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad3 != null) {
                var RSValues = values;
                var normalizedRX = RSValues.x * BABYLON.UserInputOptions.GamepadRStickSensibility;
                var normalizedRY = RSValues.y * BABYLON.UserInputOptions.GamepadRStickSensibility;
                RSValues.x = Math.abs(normalizedRX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
                RSValues.y = Math.abs(normalizedRY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
                BABYLON.InputController.g_mousex3 = (BABYLON.UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
                BABYLON.InputController.g_mousey3 = (BABYLON.UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
            }
        };
        InputController.inputFourButtonDownHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var key = "b4:" + button.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad4ButtonDown != null && BABYLON.InputController.gamepad4ButtonDown.length > 0) {
                    BABYLON.InputController.gamepad4ButtonDown.forEach(function (callback) {
                        callback(button);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad4ButtonPress != null && BABYLON.InputController.gamepad4ButtonPress.length > 0) {
                        BABYLON.InputController.gamepad4ButtonPress.forEach(function (press) {
                            if (press.index === button) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputFourButtonUpHandler = function (button) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var key = "b4:" + button.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad4ButtonUp != null && BABYLON.InputController.gamepad4ButtonUp.length > 0) {
                    BABYLON.InputController.gamepad4ButtonUp.forEach(function (callback) {
                        callback(button);
                    });
                }
            }
        };
        InputController.inputFourXboxDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var key = "d4:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad4DpadDown != null && BABYLON.InputController.gamepad4DpadDown.length > 0) {
                    BABYLON.InputController.gamepad4DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad4DpadPress != null && BABYLON.InputController.gamepad4DpadPress.length > 0) {
                        BABYLON.InputController.gamepad4DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputFourShockDPadDownHandler = function (dPadPressed) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var key = "d4:" + dPadPressed.toString();
                var pressed = false;
                if (BABYLON.InputController.keymap[key] != null) {
                    pressed = BABYLON.InputController.keymap[key];
                }
                BABYLON.InputController.keymap[key] = true;
                if (BABYLON.InputController.gamepad4DpadDown != null && BABYLON.InputController.gamepad4DpadDown.length > 0) {
                    BABYLON.InputController.gamepad4DpadDown.forEach(function (callback) {
                        callback(dPadPressed);
                    });
                }
                if (!pressed) {
                    if (BABYLON.InputController.gamepad4DpadPress != null && BABYLON.InputController.gamepad4DpadPress.length > 0) {
                        BABYLON.InputController.gamepad4DpadPress.forEach(function (press) {
                            if (press.index === dPadPressed) {
                                press.action();
                            }
                        });
                    }
                }
            }
        };
        InputController.inputFourXboxDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var key = "d4:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad4DpadUp != null && BABYLON.InputController.gamepad4DpadUp.length > 0) {
                    BABYLON.InputController.gamepad4DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputFourShockDPadUpHandler = function (dPadReleased) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var key = "d4:" + dPadReleased.toString();
                BABYLON.InputController.keymap[key] = false;
                if (BABYLON.InputController.gamepad4DpadUp != null && BABYLON.InputController.gamepad4DpadUp.length > 0) {
                    BABYLON.InputController.gamepad4DpadUp.forEach(function (callback) {
                        callback(dPadReleased);
                    });
                }
            }
        };
        InputController.inputFourXboxLeftTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                BABYLON.InputController.keymap["t4:0"] = value;
                if (BABYLON.InputController.gamepad4LeftTrigger != null && BABYLON.InputController.gamepad4LeftTrigger.length > 0) {
                    BABYLON.InputController.gamepad4LeftTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputFourXboxRightTriggerHandler = function (value) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                BABYLON.InputController.keymap["t4:1"] = value;
                if (BABYLON.InputController.gamepad4RightTrigger != null && BABYLON.InputController.gamepad4RightTrigger.length > 0) {
                    BABYLON.InputController.gamepad4RightTrigger.forEach(function (callback) {
                        callback(value);
                    });
                }
            }
        };
        InputController.inputFourLeftStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var LSValues = values;
                var normalizedLX = LSValues.x * BABYLON.UserInputOptions.GamepadLStickSensibility;
                var normalizedLY = LSValues.y * BABYLON.UserInputOptions.GamepadLStickSensibility;
                LSValues.x = Math.abs(normalizedLX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLX : 0;
                LSValues.y = Math.abs(normalizedLY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedLY : 0;
                BABYLON.InputController.g_horizontal4 = (BABYLON.UserInputOptions.GamepadLStickXInverted) ? -LSValues.x : LSValues.x;
                BABYLON.InputController.g_vertical4 = (BABYLON.UserInputOptions.GamepadLStickYInverted) ? LSValues.y : -LSValues.y;
            }
        };
        InputController.inputFourRightStickHandler = function (values) {
            if (BABYLON.SceneManager.EnableUserInput === false)
                return;
            if (BABYLON.InputController.gamepad4 != null) {
                var RSValues = values;
                var normalizedRX = RSValues.x * BABYLON.UserInputOptions.GamepadRStickSensibility;
                var normalizedRY = RSValues.y * BABYLON.UserInputOptions.GamepadRStickSensibility;
                RSValues.x = Math.abs(normalizedRX) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRX : 0;
                RSValues.y = Math.abs(normalizedRY) > BABYLON.UserInputOptions.GamepadDeadStickValue ? normalizedRY : 0;
                BABYLON.InputController.g_mousex4 = (BABYLON.UserInputOptions.GamepadRStickXInverted) ? -RSValues.x : RSValues.x;
                BABYLON.InputController.g_mousey4 = (BABYLON.UserInputOptions.GamepadRStickYInverted) ? -RSValues.y : RSValues.y;
            }
        };
        InputController.inputManagerGamepadConnected = function (pad, state) {
            if (BABYLON.InputController.gamepad1 == null && pad.index === 0) {
                BABYLON.InputController.gamepad1 = pad;
                BABYLON.Tools.Log("Gamepad One Connected: " + BABYLON.InputController.gamepad1.id);
                if (BABYLON.InputController.gamepad1 instanceof BABYLON.Xbox360Pad) {
                    BABYLON.InputController.gamepad1Type = BABYLON.GamepadType.Xbox360;
                    var xbox360Pad1 = BABYLON.InputController.gamepad1;
                    xbox360Pad1.onbuttonup(BABYLON.InputController.inputOneButtonUpHandler);
                    xbox360Pad1.onbuttondown(BABYLON.InputController.inputOneButtonDownHandler);
                    xbox360Pad1.onleftstickchanged(BABYLON.InputController.inputOneLeftStickHandler);
                    xbox360Pad1.onrightstickchanged(BABYLON.InputController.inputOneRightStickHandler);
                    xbox360Pad1.ondpadup(BABYLON.InputController.inputOneXboxDPadUpHandler);
                    xbox360Pad1.ondpaddown(BABYLON.InputController.inputOneXboxDPadDownHandler);
                    xbox360Pad1.onlefttriggerchanged(BABYLON.InputController.inputOneXboxLeftTriggerHandler);
                    xbox360Pad1.onrighttriggerchanged(BABYLON.InputController.inputOneXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad1 instanceof BABYLON.DualShockPad) {
                    BABYLON.InputController.gamepad1Type = BABYLON.GamepadType.DualShock;
                    var dualShockPad1 = BABYLON.InputController.gamepad1;
                    dualShockPad1.onbuttonup(BABYLON.InputController.inputOneButtonUpHandler);
                    dualShockPad1.onbuttondown(BABYLON.InputController.inputOneButtonDownHandler);
                    dualShockPad1.onleftstickchanged(BABYLON.InputController.inputOneLeftStickHandler);
                    dualShockPad1.onrightstickchanged(BABYLON.InputController.inputOneRightStickHandler);
                    dualShockPad1.ondpadup(BABYLON.InputController.inputOneShockDPadUpHandler);
                    dualShockPad1.ondpaddown(BABYLON.InputController.inputOneShockDPadDownHandler);
                    dualShockPad1.onlefttriggerchanged(BABYLON.InputController.inputOneXboxLeftTriggerHandler);
                    dualShockPad1.onrighttriggerchanged(BABYLON.InputController.inputOneXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad1 instanceof BABYLON.PoseEnabledController) {
                    // TODO: Handle Pose Enabled Controllers (WebVR)
                    /*
                    gamepad.onTriggerStateChangedObservable.add((button, state)=>{
                        triggerText.text = "Trigger:" + button.value;
                    })
                    gamepad.onMainButtonStateChangedObservable.add((button, state)=>{
                        buttonsText.text = "Main button:" + button.value;
                    })
                    //Stick events
                    gamepad.onleftstickchanged((values)=>{
                        stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
                    });
                    gamepad.onrightstickchanged((values)=>{
                        stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
                    });
                    */
                }
                else {
                    BABYLON.InputController.gamepad1Type = BABYLON.GamepadType.Generic;
                    var genericPad1 = BABYLON.InputController.gamepad1;
                    genericPad1.onbuttonup(BABYLON.InputController.inputOneButtonUpHandler);
                    genericPad1.onbuttondown(BABYLON.InputController.inputOneButtonDownHandler);
                    genericPad1.onleftstickchanged(BABYLON.InputController.inputOneLeftStickHandler);
                    genericPad1.onrightstickchanged(BABYLON.InputController.inputOneRightStickHandler);
                }
            }
            if (BABYLON.InputController.gamepad2 == null && pad.index === 1) {
                BABYLON.InputController.gamepad2 = pad;
                BABYLON.Tools.Log("Gamepad Two Connected: " + BABYLON.InputController.gamepad2.id);
                if (BABYLON.InputController.gamepad2 instanceof BABYLON.Xbox360Pad) {
                    BABYLON.InputController.gamepad2Type = BABYLON.GamepadType.Xbox360;
                    var xbox360Pad2 = BABYLON.InputController.gamepad2;
                    xbox360Pad2.onbuttonup(BABYLON.InputController.inputTwoButtonUpHandler);
                    xbox360Pad2.onbuttondown(BABYLON.InputController.inputTwoButtonDownHandler);
                    xbox360Pad2.onleftstickchanged(BABYLON.InputController.inputTwoLeftStickHandler);
                    xbox360Pad2.onrightstickchanged(BABYLON.InputController.inputTwoRightStickHandler);
                    xbox360Pad2.ondpadup(BABYLON.InputController.inputTwoXboxDPadUpHandler);
                    xbox360Pad2.ondpaddown(BABYLON.InputController.inputTwoXboxDPadDownHandler);
                    xbox360Pad2.onlefttriggerchanged(BABYLON.InputController.inputTwoXboxLeftTriggerHandler);
                    xbox360Pad2.onrighttriggerchanged(BABYLON.InputController.inputTwoXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad2 instanceof BABYLON.DualShockPad) {
                    BABYLON.InputController.gamepad2Type = BABYLON.GamepadType.DualShock;
                    var dualShockPad2 = BABYLON.InputController.gamepad2;
                    dualShockPad2.onbuttonup(BABYLON.InputController.inputOneButtonUpHandler);
                    dualShockPad2.onbuttondown(BABYLON.InputController.inputOneButtonDownHandler);
                    dualShockPad2.onleftstickchanged(BABYLON.InputController.inputOneLeftStickHandler);
                    dualShockPad2.onrightstickchanged(BABYLON.InputController.inputOneRightStickHandler);
                    dualShockPad2.ondpadup(BABYLON.InputController.inputOneShockDPadUpHandler);
                    dualShockPad2.ondpaddown(BABYLON.InputController.inputOneShockDPadDownHandler);
                    dualShockPad2.onlefttriggerchanged(BABYLON.InputController.inputOneXboxLeftTriggerHandler);
                    dualShockPad2.onrighttriggerchanged(BABYLON.InputController.inputOneXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad2 instanceof BABYLON.PoseEnabledController) {
                    // TODO: Handle Pose Enabled Controllers (WebVR)
                }
                else {
                    BABYLON.InputController.gamepad2Type = BABYLON.GamepadType.Generic;
                    var genericPad2 = BABYLON.InputController.gamepad2;
                    genericPad2.onbuttonup(BABYLON.InputController.inputTwoButtonUpHandler);
                    genericPad2.onbuttondown(BABYLON.InputController.inputTwoButtonDownHandler);
                    genericPad2.onleftstickchanged(BABYLON.InputController.inputTwoLeftStickHandler);
                    genericPad2.onrightstickchanged(BABYLON.InputController.inputTwoRightStickHandler);
                }
            }
            if (BABYLON.InputController.gamepad3 == null && pad.index === 2) {
                BABYLON.InputController.gamepad3 = pad;
                BABYLON.Tools.Log("Gamepad Three Connected: " + BABYLON.InputController.gamepad3.id);
                if (BABYLON.InputController.gamepad3 instanceof BABYLON.Xbox360Pad) {
                    BABYLON.InputController.gamepad3Type = BABYLON.GamepadType.Xbox360;
                    var xbox360Pad3 = BABYLON.InputController.gamepad3;
                    xbox360Pad3.onbuttonup(BABYLON.InputController.inputThreeButtonUpHandler);
                    xbox360Pad3.onbuttondown(BABYLON.InputController.inputThreeButtonDownHandler);
                    xbox360Pad3.onleftstickchanged(BABYLON.InputController.inputThreeLeftStickHandler);
                    xbox360Pad3.onrightstickchanged(BABYLON.InputController.inputThreeRightStickHandler);
                    xbox360Pad3.ondpadup(BABYLON.InputController.inputThreeXboxDPadUpHandler);
                    xbox360Pad3.ondpaddown(BABYLON.InputController.inputThreeXboxDPadDownHandler);
                    xbox360Pad3.onlefttriggerchanged(BABYLON.InputController.inputThreeXboxLeftTriggerHandler);
                    xbox360Pad3.onrighttriggerchanged(BABYLON.InputController.inputThreeXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad3 instanceof BABYLON.DualShockPad) {
                    var dualShockPad3 = BABYLON.InputController.gamepad3;
                    dualShockPad3.onbuttonup(BABYLON.InputController.inputOneButtonUpHandler);
                    dualShockPad3.onbuttondown(BABYLON.InputController.inputOneButtonDownHandler);
                    dualShockPad3.onleftstickchanged(BABYLON.InputController.inputOneLeftStickHandler);
                    dualShockPad3.onrightstickchanged(BABYLON.InputController.inputOneRightStickHandler);
                    dualShockPad3.ondpadup(BABYLON.InputController.inputOneShockDPadUpHandler);
                    dualShockPad3.ondpaddown(BABYLON.InputController.inputOneShockDPadDownHandler);
                    dualShockPad3.onlefttriggerchanged(BABYLON.InputController.inputOneXboxLeftTriggerHandler);
                    dualShockPad3.onrighttriggerchanged(BABYLON.InputController.inputOneXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad3 instanceof BABYLON.PoseEnabledController) {
                    // TODO: Handle Pose Enabled Controllers (WebVR)
                }
                else {
                    BABYLON.InputController.gamepad3Type = BABYLON.GamepadType.Generic;
                    var genericPad3 = BABYLON.InputController.gamepad3;
                    genericPad3.onbuttonup(BABYLON.InputController.inputThreeButtonUpHandler);
                    genericPad3.onbuttondown(BABYLON.InputController.inputThreeButtonDownHandler);
                    genericPad3.onleftstickchanged(BABYLON.InputController.inputThreeLeftStickHandler);
                    genericPad3.onrightstickchanged(BABYLON.InputController.inputThreeRightStickHandler);
                }
            }
            if (BABYLON.InputController.gamepad4 == null && pad.index === 3) {
                BABYLON.InputController.gamepad4 = pad;
                BABYLON.Tools.Log("Gamepad Four Connected: " + BABYLON.InputController.gamepad4.id);
                if (BABYLON.InputController.gamepad4 instanceof BABYLON.Xbox360Pad) {
                    BABYLON.InputController.gamepad4Type = BABYLON.GamepadType.Xbox360;
                    var xbox360Pad4 = BABYLON.InputController.gamepad4;
                    xbox360Pad4.onbuttonup(BABYLON.InputController.inputFourButtonUpHandler);
                    xbox360Pad4.onbuttondown(BABYLON.InputController.inputFourButtonDownHandler);
                    xbox360Pad4.onleftstickchanged(BABYLON.InputController.inputFourLeftStickHandler);
                    xbox360Pad4.onrightstickchanged(BABYLON.InputController.inputFourRightStickHandler);
                    xbox360Pad4.ondpadup(BABYLON.InputController.inputFourXboxDPadUpHandler);
                    xbox360Pad4.ondpaddown(BABYLON.InputController.inputFourXboxDPadDownHandler);
                    xbox360Pad4.onlefttriggerchanged(BABYLON.InputController.inputFourXboxLeftTriggerHandler);
                    xbox360Pad4.onrighttriggerchanged(BABYLON.InputController.inputFourXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad4 instanceof BABYLON.DualShockPad) {
                    var dualShockPad4 = BABYLON.InputController.gamepad4;
                    dualShockPad4.onbuttonup(BABYLON.InputController.inputOneButtonUpHandler);
                    dualShockPad4.onbuttondown(BABYLON.InputController.inputOneButtonDownHandler);
                    dualShockPad4.onleftstickchanged(BABYLON.InputController.inputOneLeftStickHandler);
                    dualShockPad4.onrightstickchanged(BABYLON.InputController.inputOneRightStickHandler);
                    dualShockPad4.ondpadup(BABYLON.InputController.inputOneShockDPadUpHandler);
                    dualShockPad4.ondpaddown(BABYLON.InputController.inputOneShockDPadDownHandler);
                    dualShockPad4.onlefttriggerchanged(BABYLON.InputController.inputOneXboxLeftTriggerHandler);
                    dualShockPad4.onrighttriggerchanged(BABYLON.InputController.inputOneXboxRightTriggerHandler);
                }
                else if (BABYLON.InputController.gamepad4 instanceof BABYLON.PoseEnabledController) {
                    // TODO: Handle Pose Enabled Controllers (WebVR)
                }
                else {
                    BABYLON.InputController.gamepad4Type = BABYLON.GamepadType.Generic;
                    var genericPad4 = BABYLON.InputController.gamepad4;
                    genericPad4.onbuttonup(BABYLON.InputController.inputFourButtonUpHandler);
                    genericPad4.onbuttondown(BABYLON.InputController.inputFourButtonDownHandler);
                    genericPad4.onleftstickchanged(BABYLON.InputController.inputFourLeftStickHandler);
                    genericPad4.onrightstickchanged(BABYLON.InputController.inputFourRightStickHandler);
                }
            }
            if (BABYLON.InputController.GamepadConnected != null) {
                BABYLON.InputController.GamepadConnected(pad, state);
            }
        };
        InputController.inputManagerGamepadDisconnected = function (pad, state) {
            if (BABYLON.InputController.GamepadDisconnected != null) {
                BABYLON.InputController.GamepadDisconnected(pad, state);
            }
        };
        InputController.inputManagerLeftControllerMainButton = function (controller, state) {
        };
        InputController.inputManagerLeftControllerPadState = function (controller, state) {
        };
        InputController.inputManagerLeftControllerPadValues = function (controller, state) {
        };
        InputController.inputManagerLeftControllerAuxButton = function (controller, state) {
        };
        InputController.inputManagerLeftControllerTriggered = function (controller, state) {
        };
        InputController.inputManagerRightControllerMainButton = function (controller, state) {
        };
        InputController.inputManagerRightControllerPadState = function (controller, state) {
        };
        InputController.inputManagerRightControllerPadValues = function (controller, state) {
        };
        InputController.inputManagerRightControllerAuxButton = function (controller, state) {
        };
        InputController.inputManagerRightControllerTriggered = function (controller, state) {
        };
        InputController.inputManagerControllerConnected = function (controller, state) {
            /*
            let xbox360Pad1: BABYLON.Xbox360Pad = BABYLON.InputController.gamepad1 as BABYLON.Xbox360Pad;
            xbox360Pad1.onbuttonup(BABYLON.InputController.inputOneButtonUpHandler);
            xbox360Pad1.onbuttondown(BABYLON.InputController.inputOneButtonDownHandler);
            xbox360Pad1.onleftstickchanged(BABYLON.InputController.inputOneLeftStickHandler);
            xbox360Pad1.onrightstickchanged(BABYLON.InputController.inputOneRightStickHandler);
            xbox360Pad1.ondpadup(BABYLON.InputController.inputOneXboxDPadUpHandler);
            xbox360Pad1.ondpaddown(BABYLON.InputController.inputOneXboxDPadDownHandler);
            xbox360Pad1.onlefttriggerchanged(BABYLON.InputController.inputOneXboxLeftTriggerHandler);
            xbox360Pad1.onrighttriggerchanged(BABYLON.InputController.inputOneXboxRightTriggerHandler);
            */
        };
        /** Global gamepad manager */
        InputController.GamepadManager = null;
        /** Global gamepad connect event handler */
        InputController.GamepadConnected = null;
        /** Global gamepad disconnect event handler */
        InputController.GamepadDisconnected = null;
        InputController.PointerLockedFlag = false;
        InputController.LockMousePointerObserver = null;
        // ************************************ //
        // *  Private Input Helper Functions  * //
        // ************************************ //
        InputController.input = false;
        InputController.keymap = {};
        InputController.wheel = 0;
        InputController.mousex = 0;
        InputController.mousey = 0;
        InputController.vertical = 0;
        InputController.horizontal = 0;
        InputController.mousex2 = 0;
        InputController.mousey2 = 0;
        InputController.vertical2 = 0;
        InputController.horizontal2 = 0;
        InputController.mousex3 = 0;
        InputController.mousey3 = 0;
        InputController.vertical3 = 0;
        InputController.horizontal3 = 0;
        InputController.mousex4 = 0;
        InputController.mousey4 = 0;
        InputController.vertical4 = 0;
        InputController.horizontal4 = 0;
        InputController.a_mousex = 0;
        InputController.x_wheel = 0;
        InputController.x_mousex = 0;
        InputController.x_mousey = 0;
        InputController.x_vertical = 0;
        InputController.x_horizontal = 0;
        InputController.k_mousex = 0;
        InputController.k_mousey = 0;
        InputController.k_vertical = 0;
        InputController.k_horizontal = 0;
        InputController.j_mousex = 0;
        InputController.j_mousey = 0;
        InputController.j_vertical = 0;
        InputController.j_horizontal = 0;
        InputController.g_mousex1 = 0;
        InputController.g_mousey1 = 0;
        InputController.g_vertical1 = 0;
        InputController.g_horizontal1 = 0;
        InputController.g_mousex2 = 0;
        InputController.g_mousey2 = 0;
        InputController.g_vertical2 = 0;
        InputController.g_horizontal2 = 0;
        InputController.g_mousex3 = 0;
        InputController.g_mousey3 = 0;
        InputController.g_vertical3 = 0;
        InputController.g_horizontal3 = 0;
        InputController.g_mousex4 = 0;
        InputController.g_mousey4 = 0;
        InputController.g_vertical4 = 0;
        InputController.g_horizontal4 = 0;
        InputController.mouseButtonPress = [];
        InputController.mouseButtonDown = [];
        InputController.mouseButtonUp = [];
        InputController.keyButtonPress = [];
        InputController.keyButtonDown = [];
        InputController.keyButtonUp = [];
        InputController.previousPosition = null;
        InputController.preventDefault = false;
        InputController.rightHanded = true;
        InputController.gamepad1 = null;
        InputController.gamepad1Type = -1;
        InputController.gamepad1ButtonPress = [];
        InputController.gamepad1ButtonDown = [];
        InputController.gamepad1ButtonUp = [];
        InputController.gamepad1DpadPress = [];
        InputController.gamepad1DpadDown = [];
        InputController.gamepad1DpadUp = [];
        InputController.gamepad1LeftTrigger = [];
        InputController.gamepad1RightTrigger = [];
        InputController.gamepad2 = null;
        InputController.gamepad2Type = -1;
        InputController.gamepad2ButtonPress = [];
        InputController.gamepad2ButtonDown = [];
        InputController.gamepad2ButtonUp = [];
        InputController.gamepad2DpadPress = [];
        InputController.gamepad2DpadDown = [];
        InputController.gamepad2DpadUp = [];
        InputController.gamepad2LeftTrigger = [];
        InputController.gamepad2RightTrigger = [];
        InputController.gamepad3 = null;
        InputController.gamepad3Type = -1;
        InputController.gamepad3ButtonPress = [];
        InputController.gamepad3ButtonDown = [];
        InputController.gamepad3ButtonUp = [];
        InputController.gamepad3DpadPress = [];
        InputController.gamepad3DpadDown = [];
        InputController.gamepad3DpadUp = [];
        InputController.gamepad3LeftTrigger = [];
        InputController.gamepad3RightTrigger = [];
        InputController.gamepad4 = null;
        InputController.gamepad4Type = -1;
        InputController.gamepad4ButtonPress = [];
        InputController.gamepad4ButtonDown = [];
        InputController.gamepad4ButtonUp = [];
        InputController.gamepad4DpadPress = [];
        InputController.gamepad4DpadDown = [];
        InputController.gamepad4DpadUp = [];
        InputController.gamepad4LeftTrigger = [];
        InputController.gamepad4RightTrigger = [];
        return InputController;
    }());
    BABYLON.InputController = InputController;
    /**
     * Touch Joystick Classes (https://www.cssscript.com/touch-joystick-controller/)
     * @class TouchJoystickHandler - All rights reserved (c) 2020 Mackey Kinard
     */
    var TouchJoystickHandler = /** @class */ (function () {
        function TouchJoystickHandler(stickid, maxdistance, deadzone) {
            var _this = this;
            this.active = false;
            this.touchId = null;
            this.dragStart = null;
            this.maxDistance = 0;
            this.deadZone = 0;
            this.xvalue = 0;
            this.yvalue = 0;
            this.stick = null;
            this.touchId = null; // track touch identifier in case multiple joysticks present
            this.dragStart = null; // location from which drag begins, used to calculate offsets
            this.active = false;
            this.xvalue = 0;
            this.yvalue = 0;
            this.deadZone = deadzone;
            this.maxDistance = maxdistance;
            this.stick = document.getElementById(stickid);
            if (this.stick != null) {
                this.stick.addEventListener('mousedown', function (e) { _this.handleDown(e); });
                this.stick.addEventListener('touchstart', function (e) { _this.handleDown(e); });
                document.addEventListener('mousemove', function (e) { _this.handleMove(e); }, { passive: false });
                document.addEventListener('touchmove', function (e) { _this.handleMove(e); }, { passive: false });
                document.addEventListener('mouseup', function (e) { _this.handleUp(e); });
                document.addEventListener('touchend', function (e) { _this.handleUp(e); });
            }
            else {
                console.warn("Failed to locate joystick element: " + stickid);
            }
        }
        TouchJoystickHandler.prototype.getValueX = function () { return this.xvalue; };
        TouchJoystickHandler.prototype.getValueY = function () { return this.yvalue; };
        TouchJoystickHandler.prototype.getStickElement = function () { return this.stick; };
        TouchJoystickHandler.prototype.dispose = function () {
            // TODO: Clean up shit here
        };
        TouchJoystickHandler.prototype.handleDown = function (event) {
            this.active = true;
            // all drag movements are instantaneous
            this.stick.style.transition = '0s';
            // touch event fired before mouse event; prevent redundant mouse event from firing
            event.preventDefault();
            if (event.changedTouches) {
                this.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
            }
            else {
                this.dragStart = { x: event.clientX, y: event.clientY };
            }
            // if this is a touch event, keep track of which one
            if (event.changedTouches) {
                this.touchId = event.changedTouches[0].identifier;
            }
        };
        TouchJoystickHandler.prototype.handleMove = function (event) {
            if (!this.active)
                return;
            // if this is a touch event, make sure it is the right one
            // also handle multiple simultaneous touchmove events
            var touchmoveId = null;
            if (event.changedTouches) {
                for (var i = 0; i < event.changedTouches.length; i++) {
                    if (this.touchId == event.changedTouches[i].identifier) {
                        touchmoveId = i;
                        event.clientX = event.changedTouches[i].clientX;
                        event.clientY = event.changedTouches[i].clientY;
                    }
                }
                if (touchmoveId == null)
                    return;
            }
            var xDiff = event.clientX - this.dragStart.x;
            var yDiff = event.clientY - this.dragStart.y;
            var angle = Math.atan2(yDiff, xDiff);
            var distance = Math.min(this.maxDistance, Math.hypot(xDiff, yDiff));
            var xPosition = distance * Math.cos(angle);
            var yPosition = distance * Math.sin(angle);
            // move stick image to new position
            this.stick.style.transform = "translate3d(".concat(xPosition, "px, ").concat(yPosition, "px, 0px)");
            // deadzone adjustment
            var distance2 = (distance < this.deadZone) ? 0 : this.maxDistance / (this.maxDistance - this.deadZone) * (distance - this.deadZone);
            var xPosition2 = distance2 * Math.cos(angle);
            var yPosition2 = distance2 * Math.sin(angle);
            var xPercent = parseFloat((xPosition2 / this.maxDistance).toFixed(4));
            var yPercent = parseFloat((yPosition2 / this.maxDistance).toFixed(4));
            // update X and Y values
            this.xvalue = xPercent;
            this.yvalue = yPercent;
        };
        TouchJoystickHandler.prototype.handleUp = function (event) {
            if (!this.active)
                return;
            // if this is a touch event, make sure it is the right one
            if (event.changedTouches && this.touchId != event.changedTouches[0].identifier)
                return;
            // transition the joystick position back to center
            this.stick.style.transition = '.2s';
            this.stick.style.transform = "translate3d(0px, 0px, 0px)";
            // reset everything
            this.xvalue = 0;
            this.yvalue = 0;
            this.touchId = null;
            this.active = false;
        };
        return TouchJoystickHandler;
    }());
    BABYLON.TouchJoystickHandler = TouchJoystickHandler;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    var WindowManager = /** @class */ (function () {
        function WindowManager() {
        }
        /** Are unversial windows platform services available. */
        WindowManager.IsWindows = function () {
            return (typeof Windows !== "undefined" && typeof Windows.UI !== "undefined" && typeof Windows.System !== "undefined" && typeof Windows.Foundation !== "undefined");
        };
        /** Are mobile cordova platform services available. */
        WindowManager.IsCordova = function () {
            return (window.cordova != null);
        };
        /** Are web assembly platform services available. */
        WindowManager.IsWebAssembly = function () {
            return (window.WebAssembly);
        };
        /** Is oculus browser platform agent. */
        WindowManager.IsOculusBrowser = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/OculusBrowser/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is samsung browser platform agent. */
        WindowManager.IsSamsungBrowser = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/SamsungBrowser/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is windows phone platform agent. */
        WindowManager.IsWindowsPhone = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/Windows Phone/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is blackberry web platform agent. */
        WindowManager.IsBlackBerry = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/BlackBerry/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is opera web platform agent. */
        WindowManager.IsOperaMini = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/Opera Mini/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is android web platform agent. */
        WindowManager.IsAndroid = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/Android/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is web os platform agent. */
        WindowManager.IsWebOS = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/webOS/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is ios web platform agent. */
        WindowManager.IsIOS = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is iphone web platform agent. */
        WindowManager.IsIPHONE = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/iPhone/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is ipad web platform agent. */
        WindowManager.IsIPAD = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/iPad/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is ipod web platform agent. */
        WindowManager.IsIPOD = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/iPod/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Is internet explorer 11 platform agent. */
        WindowManager.IsIE11 = function () {
            return (navigator.maxTouchPoints !== void 0);
        };
        /** Is mobile web platform agent. */
        WindowManager.IsMobile = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                var n = navigator.userAgent;
                if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone|iPad|iPod/i) || n.match(/BlackBerry/i) || n.match(/Opera Mini/i) || n.match(/Windows Phone/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Are playstation services available. */
        WindowManager.IsPlaystation = function () {
            var result = false;
            if (navigator != null && navigator.userAgent != null) {
                if (navigator.userAgent.match(/Playstation/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Are xbox console services available. */
        WindowManager.IsXboxConsole = function () {
            var result = false;
            if (BABYLON.WindowManager.IsWindows() && typeof Windows.System.Profile !== "undefined" && typeof Windows.System.Profile.AnalyticsInfo !== "undefined" && typeof Windows.System.Profile.AnalyticsInfo.versionInfo !== "undefined" && typeof Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily !== "undefined") {
                var n = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily;
                if (n.match(/Xbox/i)) {
                    result = true;
                }
            }
            return result;
        };
        /** Are xbox live platform services available. */
        WindowManager.IsXboxLive = function () {
            return (BABYLON.WindowManager.IsWindows() && typeof Microsoft !== "undefined" && typeof Microsoft.Xbox !== "undefined" && typeof Microsoft.Xbox.Services !== "undefined");
        };
        /** Open alert message dialog. */
        WindowManager.AlertMessage = function (text, title) {
            if (title === void 0) { title = "Babylon.js"; }
            var result = null;
            if (BABYLON.WindowManager.IsWindows()) {
                result = new Windows.UI.Popups.MessageDialog(text, title).showAsync();
            }
            else {
                window.alert(text);
            }
            return result;
        };
        /**  Gets the names query string from page url. */
        WindowManager.GetQueryStringParam = function (name, url) {
            if (!url)
                url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
            if (!results)
                return null;
            if (!results[2])
                return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };
        /** Is content running in a frame window */
        WindowManager.IsFrameWindow = function () { return (window.parent != null && window !== window.parent); };
        // ******************************** //
        // * Babylon Post Window Message  * //
        // ******************************** //
        /** Post a safe message to the top browser window */
        WindowManager.PostWindowMessage = function (msg, targetOrigin, localWindow) {
            if (targetOrigin === void 0) { targetOrigin = "*"; }
            if (localWindow === void 0) { localWindow = false; }
            if (localWindow === true) {
                window.postMessage(msg, targetOrigin);
            }
            else {
                if (window.top) {
                    window.top.postMessage(msg, targetOrigin);
                }
                else {
                    console.warn("No Valid Top Window");
                }
            }
        };
        // ******************************* //
        // * Babylon Scene File Loading  * //
        // ******************************* //
        /** Loads a babylon gltf scene file (engine.html) */
        WindowManager.LoadSceneFile = function (sceneFile, queryString) {
            if (queryString === void 0) { queryString = null; }
            if (BABYLON.WindowManager.IsFrameWindow()) {
                if (queryString != null && queryString !== "") {
                    BABYLON.WindowManager.PostWindowMessage({ source: "babylon", command: "loadscene", param1: sceneFile, param2: queryString }, "*");
                }
                else {
                    BABYLON.WindowManager.PostWindowMessage({ source: "babylon", command: "loadscene", param1: sceneFile, param2: null }, "*");
                }
            }
            else {
                var loaderUrl = (window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + window.location.pathname + "?scene=" + sceneFile);
                if (queryString != null && queryString !== "")
                    loaderUrl += queryString;
                window.location.replace(loaderUrl);
            }
        };
        // ************************************* //
        // * Scene Manager Inspector Functions * //
        // ************************************* //
        /** Popup debug layer in window. */
        WindowManager.PopupDebug = function (scene) {
            if (scene.debugLayer) {
                scene.debugLayer.hide();
                scene.debugLayer.show({ enablePopup: true, globalRoot: null });
            }
        };
        /** Toggle debug layer on and off. */
        WindowManager.ToggleDebug = function (scene, embed, parent) {
            if (embed === void 0) { embed = false; }
            if (parent === void 0) { parent = null; }
            if (scene.debugLayer) {
                var wnd = window;
                if (BABYLON.WindowManager.debugLayerVisible === true) {
                    BABYLON.WindowManager.debugLayerVisible = false;
                    if (wnd.METER && wnd.METER.show)
                        wnd.METER.show();
                    scene.debugLayer.hide();
                }
                else {
                    BABYLON.WindowManager.debugLayerVisible = true;
                    if (wnd.METER && wnd.METER.hide)
                        wnd.METER.hide();
                    scene.debugLayer.show({ embedMode: embed, globalRoot: parent });
                }
            }
        };
        // *********************************** //
        // * Scene Manager Storage Functions * //
        // *********************************** //
        /** Get an item from window local storage. */
        WindowManager.GetLocalStorageItem = function (key) {
            return (window.localStorage != null) ? window.localStorage.getItem(key) : null;
        };
        /** Set an item to window local storage. */
        WindowManager.SetLocalStorageItem = function (key, value) {
            if (window.localStorage != null)
                window.localStorage.setItem(key, value);
        };
        /** Get an item from window session storage. */
        WindowManager.GetSessionStorageItem = function (key) {
            return (window.sessionStorage != null) ? window.sessionStorage.getItem(key) : null;
        };
        /** Set an item to window session storage. */
        WindowManager.SetSessionStorageItem = function (key, value) {
            if (window.sessionStorage != null)
                window.sessionStorage.setItem(key, value);
        };
        // ************************************ //
        // * Scene Manager Location Functions * //
        // ************************************ //
        WindowManager.GetFilenameFromUrl = function (url) {
            return url.substring(url.lastIndexOf('/') + 1);
        };
        WindowManager.GetUrlParameter = function (key) {
            var name = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(window.location.search);
            return (results !== null) ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : null;
        };
        /** Get the scene default intenisty factor */
        WindowManager.GetIntensityFactor = function () {
            return (window["intensityFactor"] != null) ? window["intensityFactor"] : 2.0;
        };
        /** Get the system render quality local storage setting. */
        WindowManager.GetRenderQuality = function () {
            var result = BABYLON.RenderQuality.High;
            var renderQuality = BABYLON.WindowManager.GetLocalStorageItem("renderQuality");
            if (renderQuality != null && renderQuality !== "") {
                result = parseInt(renderQuality);
            }
            return result;
        };
        /** Set the system render quality local storage setting. */
        WindowManager.SetRenderQuality = function (quality) {
            var renderQuality = quality;
            BABYLON.WindowManager.SetLocalStorageItem("renderQuality", renderQuality.toString().toLowerCase());
        };
        /** Get the system virtual reality local storage setting. */
        WindowManager.GetVirtualRealityEnabled = function () {
            var virtualReality = BABYLON.WindowManager.GetLocalStorageItem("virtualReality");
            return (virtualReality != null && virtualReality === "true");
        };
        /** Set the system virtual reality local storage setting. */
        WindowManager.SetVirtualRealityEnabled = function (enabled) {
            BABYLON.WindowManager.SetLocalStorageItem("virtualReality", enabled.toString().toLowerCase());
        };
        /** Set the Windows Runtime preferred launch windowing mode. (Example: Windows.UI.ViewManagement.ApplicationViewWindowingMode.fullScreen = 1) */
        WindowManager.SetWindowsLaunchMode = function (mode) {
            if (mode === void 0) { mode = 1; }
            if (BABYLON.WindowManager.IsWindows() && typeof Windows.UI.ViewManagement !== "undefined" && typeof Windows.UI.ViewManagement.ApplicationView !== "undefined") {
                Windows.UI.ViewManagement.ApplicationView.preferredLaunchWindowingMode = mode;
            }
        };
        /** Show the default page error message. */
        WindowManager.ShowPageErrorMessage = function (message, title, timeout) {
            if (title === void 0) { title = "Error"; }
            if (timeout === void 0) { timeout = 0; }
            if (window.showErrorMessage) {
                window.showErrorMessage(message, title, timeout);
            }
        };
        /** Quit the Windows Runtime host application. */
        WindowManager.QuitWindowsApplication = function () {
            if (BABYLON.WindowManager.IsWindows()) {
                window.close();
            }
        };
        /* DEPRECIATED: requires fonts.d.ts
        public static CreateFontFace(scene:BABYLON.Scene, family:string, asset:BABYLON.IUnityFontAsset, descriptors:FontFaceDescriptors = null, oncomplete:(fontFace:FontFace)=>void = null):FontFace {
            const fontUrl:string = BABYLON.SceneManager.GetRootUrl(scene) + asset.filename;
            const result:FontFace = new FontFace(family, `url("${fontUrl}") format("${asset.format}")`, descriptors);
            if (result != null) {
                document.fonts.add(result);
                if (oncomplete != null) {
                    result.loaded.then((fontFace:FontFace) => {
                        oncomplete(fontFace);
                    }, (reason:any)=>{
                        oncomplete(null);
                    });
                }
            }
            return result;
        }
        public static CreateFontFaceElement(scene:BABYLON.Scene, family:string, asset:BABYLON.IUnityFontAsset, options:string = null):HTMLStyleElement {
            const result:HTMLStyleElement = document.createElement("style");
            const fontUrl:string = BABYLON.SceneManager.GetRootUrl(scene) + asset.filename;
            result.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(result);
            if (options != null && options !== "") {
                result.innerHTML = `@font-face { font-family: "${family}"; src: url("${fontUrl}") format("${asset.format}"); ${options} }`;
            } else {
                result.innerHTML = `@font-face { font-family: "${family}"; src: url("${fontUrl}") format("${asset.format}"); }`;
            }
            return result;
        }
        */
        // *********************************** //
        // * Public Print To Screen Support  * //
        // *********************************** //
        /** TODO */
        WindowManager.PrintToScreen = function (text, color) {
            if (color === void 0) { color = "white"; }
            BABYLON.WindowManager.PrintElement = document.getElementById("print");
            if (BABYLON.WindowManager.PrintElement == null) {
                var printer = document.createElement("div");
                printer.id = "print";
                printer.style.position = "absolute";
                printer.style.left = "6px";
                printer.style.bottom = "3px";
                printer.style.fontSize = "12px";
                printer.style.zIndex = "10000";
                printer.style.color = "#0c0";
                document.body.appendChild(printer);
                BABYLON.WindowManager.PrintElement = printer;
            }
            if (BABYLON.WindowManager.PrintElement != null && BABYLON.WindowManager.PrintElement.innerHTML !== text) {
                if (BABYLON.WindowManager.PrintElement.style.color !== color)
                    BABYLON.WindowManager.PrintElement.style.color = color;
                BABYLON.WindowManager.PrintElement.innerHTML = text;
            }
        };
        WindowManager.debugLayerVisible = false;
        WindowManager.PrintElement = null;
        return WindowManager;
    }());
    BABYLON.WindowManager = WindowManager;
})(BABYLON || (BABYLON = {}));
if (BABYLON.WindowManager.IsWindows()) {
    if (typeof Windows.UI.ViewManagement !== "undefined" && typeof Windows.UI.ViewManagement.ApplicationViewBoundsMode !== "undefined" && typeof Windows.UI.ViewManagement.ApplicationViewBoundsMode.useCoreWindow !== "undefined") {
        Windows.UI.ViewManagement.ApplicationView.getForCurrentView().setDesiredBoundsMode(Windows.UI.ViewManagement.ApplicationViewBoundsMode.useCoreWindow);
    }
}
if (BABYLON.WindowManager.IsXboxConsole()) {
    if (navigator.gamepadInputEmulation) {
        navigator.gamepadInputEmulation = "gamepad";
    }
}
/**
 * Babylon Window Manager Alias
 */
var WM = BABYLON.WindowManager;
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon toolkit default camera system class
     * @class DefaultCameraSystem - All rights reserved (c) 2020 Mackey Kinard
     * https://doc.babylonjs.com/divingDeeper/postProcesses/defaultRenderingPipeline
     */
    var DefaultCameraSystem = /** @class */ (function (_super) {
        __extends(DefaultCameraSystem, _super);
        function DefaultCameraSystem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.mainCamera = false;
            _this.cameraType = 0;
            _this.cameraInertia = 0.5;
            _this.cameraController = null;
            _this.immersiveOptions = null;
            _this.arcRotateConfig = null;
            _this.multiPlayerSetup = null;
            _this.editorPostProcessing = null;
            _this.m_cameraRig = null;
            return _this;
        }
        DefaultCameraSystem.GetRenderingPipeline = function () { return PROJECT.DefaultCameraSystem.renderingPipeline; };
        ;
        DefaultCameraSystem.GetScreenSpacePipeline = function () { return PROJECT.DefaultCameraSystem.screenSpacePipeline; };
        ;
        DefaultCameraSystem.IsCameraSystemReady = function () { return PROJECT.DefaultCameraSystem.cameraReady; };
        DefaultCameraSystem.prototype.isMainCamera = function () { return this.mainCamera; };
        DefaultCameraSystem.prototype.getCameraType = function () { return this.cameraType; };
        DefaultCameraSystem.prototype.awake = function () { this.awakeCameraSystemState(); };
        DefaultCameraSystem.prototype.start = function () { this.startCameraSystemState(); };
        DefaultCameraSystem.prototype.update = function () { this.updateCameraSystemState(); };
        DefaultCameraSystem.prototype.destroy = function () { this.destroyCameraSystemState(); };
        /////////////////////////////////////////////
        // Universal Camera System State Functions //
        /////////////////////////////////////////////
        DefaultCameraSystem.prototype.awakeCameraSystemState = function () {
            this.mainCamera = (this.getTransformTag() === "MainCamera");
            this.cameraType = this.getProperty("mainCameraType", this.cameraType);
            this.cameraInertia = this.getProperty("setCameraInertia", this.cameraInertia);
            this.immersiveOptions = this.getProperty("immersiveOptions", this.immersiveOptions);
            this.arcRotateConfig = this.getProperty("arcRotateConfig", this.arcRotateConfig);
            this.multiPlayerSetup = this.getProperty("multiPlayerSetup", this.multiPlayerSetup);
            this.cameraController = this.getProperty("cameraController", this.cameraController);
            this.editorPostProcessing = this.getProperty("renderingPipeline", this.editorPostProcessing);
            this.cleanCameraSystemState();
        };
        DefaultCameraSystem.prototype.startCameraSystemState = function () {
            return __awaiter(this, void 0, void 0, function () {
                var cinput, mouseInput, localStorageRequired, webvrFloorMeshes, webvrHelperOptions, webvrImmersiveMode, webvrReferenceType, _a, navmesh, cameraName, playerOneTransform, playerOneName, playerOneCamerax, playerTwoTransform, playerTwoName, playerTwoCamerax, playerThreeTransform, playerThreeName, playerThreeCamerax, playerFourTransform, playerFourName, playerFourCamerax, quality, allowProcessing, defaultPipeline, vcolor, colorGradingTexture, curve, ssaoRatio, ssaoPipeline;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            BABYLON.Utilities.ValidateTransformQuaternion(this.transform);
                            if (this.multiPlayerSetup != null) {
                                PROJECT.DefaultCameraSystem.startupMode = this.multiPlayerSetup.playerStartupMode;
                                PROJECT.DefaultCameraSystem.stereoCameras = this.multiPlayerSetup.stereoSideBySide;
                            }
                            // ..
                            // Default Camera System Support
                            // ..
                            this.m_cameraRig = this.getCameraRig();
                            if (!(this.m_cameraRig != null)) return [3 /*break*/, 6];
                            this.m_cameraRig.inertia = this.cameraInertia;
                            if (this.cameraController != null) {
                                this.m_cameraRig.speed = this.cameraController.cameraSpeed;
                                this.m_cameraRig.inverseRotationSpeed = this.cameraController.invRotationSpeed;
                                if (this.m_cameraRig instanceof BABYLON.UniversalCamera) {
                                    this.m_cameraRig.gamepadAngularSensibility = this.cameraController.gamepadRotation;
                                    this.m_cameraRig.gamepadMoveSensibility = this.cameraController.gamepadMovement;
                                    this.m_cameraRig.touchAngularSensibility = this.cameraController.touchRotation;
                                    this.m_cameraRig.touchMoveSensibility = this.cameraController.touchMovement;
                                }
                                if (this.cameraController.keyboardWASD === true) {
                                    if (this.m_cameraRig.inputs != null && this.m_cameraRig.inputs.attached != null && this.m_cameraRig.inputs.attached.keyboard != null) {
                                        if (this.m_cameraRig.inputs.attached.keyboard instanceof BABYLON.FreeCameraKeyboardMoveInput) {
                                            cinput = this.m_cameraRig.inputs.attached.keyboard;
                                            cinput.keysUp.push(BABYLON.UserInputKey.W);
                                            cinput.keysLeft.push(BABYLON.UserInputKey.A);
                                            cinput.keysDown.push(BABYLON.UserInputKey.S);
                                            cinput.keysRight.push(BABYLON.UserInputKey.D);
                                            cinput.rotationSpeed = this.cameraController.rotationSpeed;
                                            if (this.cameraController.arrowKeyRotation === true) {
                                                cinput.keysLeft = [BABYLON.UserInputKey.A];
                                                cinput.keysRight = [BABYLON.UserInputKey.D];
                                                cinput.keysRotateLeft = [BABYLON.UserInputKey.LeftArrow];
                                                cinput.keysRotateRight = [BABYLON.UserInputKey.RightArrow];
                                            }
                                        }
                                    }
                                }
                            }
                            if (this.m_cameraRig.inputs != null && this.m_cameraRig.inputs.attached != null && this.m_cameraRig.inputs.attached.mouse != null) {
                                mouseInput = this.m_cameraRig.inputs.attached.mouse;
                                // ..
                                // NOTE: Touch Enabled Mouse Hack
                                // ..
                                if (BABYLON.Utilities.HasOwnProperty(mouseInput, "touchEnabled")) {
                                    mouseInput.touchEnabled = true;
                                }
                            }
                            if (!(this.cameraType === 0 || this.cameraType === 4)) return [3 /*break*/, 1];
                            //if (PROJECT.DefaultCameraSystem.PlayerOneCamera == null) {
                            PROJECT.DefaultCameraSystem.PlayerOneCamera = this.m_cameraRig;
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.inertia = this.cameraInertia;
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.transform = this.transform;
                            return [3 /*break*/, 5];
                        case 1:
                            if (!(this.cameraType === 1 || this.cameraType === 2)) return [3 /*break*/, 4];
                            //if (PROJECT.DefaultCameraSystem.PlayerOneCamera == null) {
                            PROJECT.DefaultCameraSystem.PlayerOneCamera = this.m_cameraRig;
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.inertia = this.cameraInertia;
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.transform = this.transform;
                            if (!(this.immersiveOptions != null)) return [3 /*break*/, 3];
                            localStorageRequired = (this.immersiveOptions.localStorageOption === true);
                            if (!(localStorageRequired === false || (localStorageRequired === true && BABYLON.WindowManager.GetVirtualRealityEnabled()))) return [3 /*break*/, 3];
                            webvrFloorMeshes = null;
                            webvrHelperOptions = null;
                            webvrImmersiveMode = (this.cameraType === 1) ? "immersive-ar" : "immersive-vr";
                            webvrReferenceType = "local-floor";
                            switch (this.immersiveOptions.referenceSpaceType) {
                                case 0:
                                    webvrReferenceType = "viewer";
                                    break;
                                case 1:
                                    webvrReferenceType = "local";
                                    break;
                                case 2:
                                    webvrReferenceType = "local-floor";
                                    break;
                                case 4:
                                    webvrReferenceType = "unbounded";
                                    break;
                                default:
                                    webvrReferenceType = "local-floor";
                                    break;
                            }
                            if (this.immersiveOptions.setFloorMeshesTags == null || this.immersiveOptions.setFloorMeshesTags === "")
                                this.immersiveOptions.setFloorMeshesTags = "Navigation";
                            if (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === true)
                                webvrFloorMeshes = this.scene.getMeshesByTags(this.immersiveOptions.setFloorMeshesTags);
                            if (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === true && webvrFloorMeshes != null && webvrFloorMeshes.length > 0) {
                                webvrHelperOptions = {
                                    floorMeshes: webvrFloorMeshes,
                                    optionalFeatures: this.immersiveOptions.optionalFeatures,
                                    useStablePlugins: this.immersiveOptions.useStablePlugins,
                                    renderingGroupId: this.immersiveOptions.renderingGroupNum,
                                    disableDefaultUI: this.immersiveOptions.disableUserInterface,
                                    disableTeleportation: (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === false),
                                    disablePointerSelection: this.immersiveOptions.disablePointerSelect,
                                    ignoreNativeCameraTransformation: this.immersiveOptions.ignoreNativeCamera,
                                    inputOptions: {
                                        doNotLoadControllerMeshes: this.immersiveOptions.experienceInputOptions.disableMeshLoad,
                                        forceInputProfile: this.immersiveOptions.experienceInputOptions.forceInputProfile,
                                        disableOnlineControllerRepository: this.immersiveOptions.experienceInputOptions.disableRepository,
                                        customControllersRepositoryURL: this.immersiveOptions.experienceInputOptions.customRepository,
                                        disableControllerAnimation: this.immersiveOptions.experienceInputOptions.disableModelAnim,
                                        controllerOptions: {
                                            disableMotionControllerAnimation: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlAnim,
                                            doNotLoadControllerMesh: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlMesh,
                                            forceControllerProfile: this.immersiveOptions.experienceInputOptions.controllerOptions.forceCtrlProfile,
                                            renderingGroupId: this.immersiveOptions.experienceInputOptions.controllerOptions.renderingGroup
                                        }
                                    },
                                    uiOptions: {
                                        sessionMode: webvrImmersiveMode,
                                        referenceSpaceType: webvrReferenceType
                                    }
                                };
                            }
                            else {
                                webvrHelperOptions = {
                                    optionalFeatures: this.immersiveOptions.optionalFeatures,
                                    useStablePlugins: this.immersiveOptions.useStablePlugins,
                                    renderingGroupId: this.immersiveOptions.renderingGroupNum,
                                    disableDefaultUI: this.immersiveOptions.disableUserInterface,
                                    disableTeleportation: (this.immersiveOptions.defaultTeleportationSetup.useTeleportation === false),
                                    disablePointerSelection: this.immersiveOptions.disablePointerSelect,
                                    ignoreNativeCameraTransformation: this.immersiveOptions.ignoreNativeCamera,
                                    inputOptions: {
                                        doNotLoadControllerMeshes: this.immersiveOptions.experienceInputOptions.disableMeshLoad,
                                        forceInputProfile: this.immersiveOptions.experienceInputOptions.forceInputProfile,
                                        disableOnlineControllerRepository: this.immersiveOptions.experienceInputOptions.disableRepository,
                                        customControllersRepositoryURL: this.immersiveOptions.experienceInputOptions.customRepository,
                                        disableControllerAnimation: this.immersiveOptions.experienceInputOptions.disableModelAnim,
                                        controllerOptions: {
                                            disableMotionControllerAnimation: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlAnim,
                                            doNotLoadControllerMesh: this.immersiveOptions.experienceInputOptions.controllerOptions.disableCtrlMesh,
                                            forceControllerProfile: this.immersiveOptions.experienceInputOptions.controllerOptions.forceCtrlProfile,
                                            renderingGroupId: this.immersiveOptions.renderingGroupNum
                                        }
                                    },
                                    uiOptions: {
                                        sessionMode: webvrImmersiveMode,
                                        referenceSpaceType: webvrReferenceType
                                    }
                                };
                            }
                            _a = PROJECT.DefaultCameraSystem;
                            return [4 /*yield*/, this.scene.createDefaultXRExperienceAsync(webvrHelperOptions)];
                        case 2:
                            _a.XRExperienceHelper = _b.sent();
                            if (PROJECT.DefaultCameraSystem.XRExperienceHelper != null && PROJECT.DefaultCameraSystem.XRExperienceHelper.baseExperience != null) {
                                if (PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation != null) {
                                    PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.rotationAngle = BABYLON.Tools.ToRadians(this.immersiveOptions.defaultTeleportationSetup.turningAxisAngle);
                                    PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.rotationEnabled = this.immersiveOptions.defaultTeleportationSetup.rotationsEnabled;
                                    PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.backwardsMovementEnabled = this.immersiveOptions.defaultTeleportationSetup.backwardsEnabled;
                                    PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.backwardsTeleportationDistance = this.immersiveOptions.defaultTeleportationSetup.backwardsDistance;
                                    PROJECT.DefaultCameraSystem.XRExperienceHelper.teleportation.parabolicCheckRadius = this.immersiveOptions.defaultTeleportationSetup.parabolicRadius;
                                }
                                if (PROJECT.DefaultCameraSystem.OnXRExperienceHelperObservable.hasObservers() === true) {
                                    PROJECT.DefaultCameraSystem.OnXRExperienceHelperObservable.notifyObservers(PROJECT.DefaultCameraSystem.XRExperienceHelper);
                                }
                                if (BABYLON.SceneManager.HasNavigationData()) {
                                    navmesh = BABYLON.SceneManager.GetNavigationMesh();
                                    PROJECT.DefaultCameraSystem.SetupNavigationWebXR(navmesh, this.immersiveOptions.setFloorMeshesTags);
                                }
                                else {
                                    BABYLON.SceneManager.OnNavMeshReadyObservable.addOnce(function (navmesh) {
                                        PROJECT.DefaultCameraSystem.SetupNavigationWebXR(navmesh, _this.immersiveOptions.setFloorMeshesTags);
                                    });
                                }
                            }
                            else {
                                BABYLON.SceneManager.LogWarning("WebXR not supported in current browser.");
                            }
                            _b.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            if (this.cameraType === 3) { // Multi Player Camera
                                cameraName = this.m_cameraRig.name;
                                playerOneTransform = new BABYLON.TransformNode("Player Camera 1", this.scene);
                                playerOneTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                                playerOneTransform.position = this.transform.position.clone();
                                playerOneTransform.parent = this.transform.parent;
                                playerOneName = cameraName + ".1";
                                playerOneCamerax = this.m_cameraRig.clone(playerOneName);
                                playerOneCamerax.name = playerOneName;
                                playerOneCamerax.parent = playerOneTransform;
                                playerOneCamerax.position = new BABYLON.Vector3(0, 0, 0);
                                playerOneCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                                playerOneCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                                playerOneCamerax.setEnabled(false);
                                PROJECT.DefaultCameraSystem.PlayerOneCamera = playerOneCamerax;
                                PROJECT.DefaultCameraSystem.PlayerOneCamera.inertia = this.cameraInertia;
                                PROJECT.DefaultCameraSystem.PlayerOneCamera.transform = playerOneTransform;
                                playerOneTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerOneCamera;
                                playerTwoTransform = new BABYLON.TransformNode("Player Camera 2", this.scene);
                                playerTwoTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                                playerTwoTransform.position = this.transform.position.clone();
                                playerTwoTransform.parent = this.transform.parent;
                                playerTwoName = cameraName + ".2";
                                playerTwoCamerax = this.m_cameraRig.clone(playerTwoName);
                                playerTwoCamerax.name = playerTwoName;
                                playerTwoCamerax.parent = playerTwoTransform;
                                playerTwoCamerax.position = new BABYLON.Vector3(0, 0, 0);
                                playerTwoCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                                playerTwoCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                                playerTwoCamerax.setEnabled(false);
                                PROJECT.DefaultCameraSystem.PlayerTwoCamera = playerTwoCamerax;
                                PROJECT.DefaultCameraSystem.PlayerTwoCamera.inertia = this.cameraInertia;
                                PROJECT.DefaultCameraSystem.PlayerTwoCamera.transform = playerTwoTransform;
                                playerTwoTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerTwoCamera;
                                playerThreeTransform = new BABYLON.TransformNode("Player Camera 3", this.scene);
                                playerThreeTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                                playerThreeTransform.position = this.transform.position.clone();
                                playerThreeTransform.parent = this.transform.parent;
                                playerThreeName = cameraName + ".3";
                                playerThreeCamerax = this.m_cameraRig.clone(playerThreeName);
                                playerThreeCamerax.name = playerThreeName;
                                playerThreeCamerax.parent = playerThreeTransform;
                                playerThreeCamerax.position = new BABYLON.Vector3(0, 0, 0);
                                playerThreeCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                                playerThreeCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                                playerThreeCamerax.setEnabled(false);
                                PROJECT.DefaultCameraSystem.PlayerThreeCamera = playerThreeCamerax;
                                PROJECT.DefaultCameraSystem.PlayerThreeCamera.inertia = this.cameraInertia;
                                PROJECT.DefaultCameraSystem.PlayerThreeCamera.transform = playerThreeTransform;
                                playerThreeTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerThreeCamera;
                                playerFourTransform = new BABYLON.TransformNode("Player Camera 4", this.scene);
                                playerFourTransform.rotationQuaternion = this.transform.rotationQuaternion.clone();
                                playerFourTransform.position = this.transform.position.clone();
                                playerFourTransform.parent = this.transform.parent;
                                playerFourName = cameraName + ".4";
                                playerFourCamerax = this.m_cameraRig.clone(playerFourName);
                                playerFourCamerax.name = playerFourName;
                                playerFourCamerax.parent = playerFourTransform;
                                playerFourCamerax.position = new BABYLON.Vector3(0, 0, 0);
                                playerFourCamerax.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                                playerFourCamerax.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                                playerFourCamerax.setEnabled(false);
                                PROJECT.DefaultCameraSystem.PlayerFourCamera = playerFourCamerax;
                                PROJECT.DefaultCameraSystem.PlayerFourCamera.inertia = this.cameraInertia;
                                PROJECT.DefaultCameraSystem.PlayerFourCamera.transform = playerFourTransform;
                                playerFourTransform.cameraRig = PROJECT.DefaultCameraSystem.PlayerFourCamera;
                                //}
                                PROJECT.DefaultCameraSystem.multiPlayerView = true;
                                PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(this.scene, PROJECT.DefaultCameraSystem.startupMode);
                            }
                            _b.label = 5;
                        case 5:
                            // ..
                            // Validate Camera Attach Control
                            // ..
                            if (this.cameraController.attachControl === true) {
                                this.m_cameraRig.parent = null; // Detach Camera Parent When Attaching Control
                                this.m_cameraRig.position.copyFrom(this.transform.position);
                                this.m_cameraRig.rotationQuaternion = (this.transform.rotationQuaternion != null) ? this.transform.rotationQuaternion.clone() : BABYLON.Quaternion.FromEulerAngles(this.transform.rotation.x, this.transform.rotation.y, this.transform.rotation.z);
                                if (this.m_cameraRig instanceof BABYLON.FreeCamera) { // Note: Check Base Class For Universal Camera
                                    this.m_cameraRig.checkCollisions = this.cameraController.checkCollisions;
                                    this.m_cameraRig.applyGravity = this.cameraController.setApplyGravity;
                                }
                                this.m_cameraRig.attachControl(this.cameraController.preventDefault);
                            }
                            _b.label = 6;
                        case 6:
                            quality = BABYLON.RenderQuality.High;
                            allowProcessing = (quality === BABYLON.RenderQuality.High);
                            //if (PROJECT.DefaultCameraSystem.renderingPipeline == null) {
                            if (allowProcessing === true && this.editorPostProcessing != null && this.editorPostProcessing.usePostProcessing === true) {
                                PROJECT.DefaultCameraSystem.renderingPipeline = new BABYLON.DefaultRenderingPipeline("DefaultCameraSystem", this.editorPostProcessing.highDynamicRange, this.scene, this.scene.cameras, true);
                                if (PROJECT.DefaultCameraSystem.renderingPipeline.isSupported === true) {
                                    defaultPipeline = PROJECT.DefaultCameraSystem.renderingPipeline;
                                    defaultPipeline.samples = this.editorPostProcessing.screenAntiAliasing.msaaSamples; // 1 by default (MSAA)
                                    /* Image Processing */
                                    defaultPipeline.imageProcessingEnabled = this.editorPostProcessing.imageProcessingConfig.imageProcessing; //true by default
                                    if (defaultPipeline.imageProcessingEnabled) {
                                        defaultPipeline.imageProcessing.contrast = this.editorPostProcessing.imageProcessingConfig.imageContrast; // 1 by default
                                        defaultPipeline.imageProcessing.exposure = this.editorPostProcessing.imageProcessingConfig.imageExposure; // 1 by default
                                        defaultPipeline.imageProcessing.vignetteEnabled = this.editorPostProcessing.imageProcessingConfig.vignetteEnabled;
                                        if (defaultPipeline.imageProcessing.vignetteEnabled) {
                                            defaultPipeline.imageProcessing.vignetteBlendMode = this.editorPostProcessing.imageProcessingConfig.vignetteBlendMode;
                                            defaultPipeline.imageProcessing.vignetteCameraFov = this.editorPostProcessing.imageProcessingConfig.vignetteCameraFov;
                                            defaultPipeline.imageProcessing.vignetteCentreX = this.editorPostProcessing.imageProcessingConfig.vignetteCentreX;
                                            defaultPipeline.imageProcessing.vignetteCentreY = this.editorPostProcessing.imageProcessingConfig.vignetteCentreY;
                                            defaultPipeline.imageProcessing.vignetteStretch = this.editorPostProcessing.imageProcessingConfig.vignetteStretch;
                                            defaultPipeline.imageProcessing.vignetteWeight = this.editorPostProcessing.imageProcessingConfig.vignetteWeight;
                                            if (this.editorPostProcessing.imageProcessingConfig.vignetteColor != null) {
                                                vcolor = BABYLON.Utilities.ParseColor4(this.editorPostProcessing.imageProcessingConfig.vignetteColor);
                                                if (vcolor != null)
                                                    defaultPipeline.imageProcessing.vignetteColor = vcolor;
                                            }
                                        }
                                        /* Color Grading */
                                        defaultPipeline.imageProcessing.colorGradingEnabled = this.editorPostProcessing.imageProcessingConfig.useColorGrading; // false by default
                                        if (defaultPipeline.imageProcessing.colorGradingEnabled) {
                                            // KEEP FOR REFERENCE
                                            /* using .3dl (best) : defaultPipeline.imageProcessing.colorGradingTexture = new BABYLON.ColorGradingTexture("textures/LateSunset.3dl", this.scene); */
                                            /* using .png :
                                            var colorGradingTexture = new BABYLON.Texture("textures/colorGrade-highContrast.png", this.scene, true, false);
                                            colorGradingTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                            colorGradingTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                            defaultPipeline.imageProcessing.colorGradingTexture = colorGradingTexture;
                                            defaultPipeline.imageProcessing.colorGradingWithGreenDepth = false; */
                                            //////////////////////////////////////////////////////////////////////////
                                            if (this.editorPostProcessing.imageProcessingConfig.setGradingTexture != null) {
                                                colorGradingTexture = BABYLON.Utilities.ParseTexture(this.editorPostProcessing.imageProcessingConfig.setGradingTexture, this.scene, true, false);
                                                colorGradingTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                                colorGradingTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                                                defaultPipeline.imageProcessing.colorGradingTexture = colorGradingTexture;
                                                defaultPipeline.imageProcessing.colorGradingWithGreenDepth = false;
                                            }
                                        }
                                        /* Color Curves */
                                        defaultPipeline.imageProcessing.colorCurvesEnabled = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.curvesEnabled; // false by default
                                        if (defaultPipeline.imageProcessing.colorCurvesEnabled) {
                                            curve = new BABYLON.ColorCurves();
                                            curve.globalDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalDen; // 0 by default
                                            curve.globalExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalExp; // 0 by default
                                            curve.globalHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalHue; // 30 by default
                                            curve.globalSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.globalSat; // 0 by default
                                            curve.highlightsDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsDen; // 0 by default
                                            curve.highlightsExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsExp; // 0 by default
                                            curve.highlightsHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsHue; // 30 by default
                                            curve.highlightsSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.highlightsSat; // 0 by default
                                            curve.midtonesDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesDen; // 0 by default
                                            curve.midtonesExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesExp; // 0 by default
                                            curve.midtonesHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesHue; // 30 by default
                                            curve.midtonesSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.midtonesSat; // 0 by default
                                            curve.shadowsDensity = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsDen; // 0 by default
                                            curve.shadowsExposure = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsExp; // 800 by default
                                            curve.shadowsHue = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsHue; // 30 by default
                                            curve.shadowsSaturation = this.editorPostProcessing.imageProcessingConfig.imagingColorCurves.shadowsSat; // 0 by default;
                                            defaultPipeline.imageProcessing.colorCurves = curve;
                                        }
                                    }
                                    /* Bloom */
                                    defaultPipeline.bloomEnabled = this.editorPostProcessing.bloomEffectProperties.bloomEnabled; // false by default
                                    if (defaultPipeline.bloomEnabled) {
                                        defaultPipeline.bloomKernel = this.editorPostProcessing.bloomEffectProperties.bloomKernel; // 64 by default
                                        defaultPipeline.bloomScale = this.editorPostProcessing.bloomEffectProperties.bloomScale; // 0.5 by default
                                        defaultPipeline.bloomWeight = this.editorPostProcessing.bloomEffectProperties.bloomWeight; // 0.15 by default
                                        defaultPipeline.bloomThreshold = this.editorPostProcessing.bloomEffectProperties.bloomThreshold; // 0.9 by default
                                    }
                                    /* Chromatic Abberation */
                                    defaultPipeline.chromaticAberrationEnabled = this.editorPostProcessing.chromaticAberration.aberrationEnabled; // false by default
                                    if (defaultPipeline.chromaticAberrationEnabled) {
                                        defaultPipeline.chromaticAberration.aberrationAmount = this.editorPostProcessing.chromaticAberration.aberrationAmount; // 30 by default
                                        defaultPipeline.chromaticAberration.adaptScaleToCurrentViewport = this.editorPostProcessing.chromaticAberration.adaptScaleViewport; // false by default
                                        defaultPipeline.chromaticAberration.alphaMode = this.editorPostProcessing.chromaticAberration.alphaMode; // 0 by default
                                        defaultPipeline.chromaticAberration.alwaysForcePOT = this.editorPostProcessing.chromaticAberration.alwaysForcePOT; // false by default
                                        defaultPipeline.chromaticAberration.enablePixelPerfectMode = this.editorPostProcessing.chromaticAberration.pixelPerfectMode; // false by default
                                        defaultPipeline.chromaticAberration.forceFullscreenViewport = this.editorPostProcessing.chromaticAberration.fullscreenViewport; // true by default
                                    }
                                    /* DOF */
                                    defaultPipeline.depthOfFieldEnabled = this.editorPostProcessing.focalDepthOfField.depthOfField; // false by default
                                    if (defaultPipeline.depthOfFieldEnabled && defaultPipeline.depthOfField.isSupported) {
                                        defaultPipeline.depthOfFieldBlurLevel = this.editorPostProcessing.focalDepthOfField.blurLevel; // 0 by default
                                        defaultPipeline.depthOfField.fStop = this.editorPostProcessing.focalDepthOfField.focalStop; // 1.4 by default
                                        defaultPipeline.depthOfField.focalLength = this.editorPostProcessing.focalDepthOfField.focalLength; // 50 by default, mm
                                        defaultPipeline.depthOfField.focusDistance = this.editorPostProcessing.focalDepthOfField.focusDistance; // 2000 by default, mm
                                        defaultPipeline.depthOfField.lensSize = this.editorPostProcessing.focalDepthOfField.maxLensSize; // 50 by default
                                    }
                                    /* FXAA */
                                    defaultPipeline.fxaaEnabled = this.editorPostProcessing.screenAntiAliasing.fxaaEnabled; // false by default
                                    if (defaultPipeline.fxaaEnabled) {
                                        defaultPipeline.fxaa.samples = this.editorPostProcessing.screenAntiAliasing.fxaaSamples; // 1 by default
                                        defaultPipeline.fxaa.adaptScaleToCurrentViewport = this.editorPostProcessing.screenAntiAliasing.fxaaScaling; // false by default
                                    }
                                    /* GlowLayer */
                                    defaultPipeline.glowLayerEnabled = this.editorPostProcessing.glowLayerProperties.glowEnabled;
                                    if (defaultPipeline.glowLayerEnabled) {
                                        defaultPipeline.glowLayer.intensity = this.editorPostProcessing.glowLayerProperties.glowIntensity; // 1 by default
                                        defaultPipeline.glowLayer.blurKernelSize = this.editorPostProcessing.glowLayerProperties.blurKernelSize; // 16 by default
                                    }
                                    /* Grain */
                                    defaultPipeline.grainEnabled = this.editorPostProcessing.grainEffectProperties.grainEnabled;
                                    if (defaultPipeline.grainEnabled) {
                                        defaultPipeline.grain.animated = this.editorPostProcessing.grainEffectProperties.grainAnimated; // false by default
                                        defaultPipeline.grain.intensity = this.editorPostProcessing.grainEffectProperties.grainIntensity; // 30 by default
                                        defaultPipeline.grain.adaptScaleToCurrentViewport = this.editorPostProcessing.grainEffectProperties.adaptScaleViewport; // false by default
                                    }
                                    /* Sharpen */
                                    defaultPipeline.sharpenEnabled = this.editorPostProcessing.sharpEffectProperties.sharpenEnabled;
                                    if (defaultPipeline.sharpenEnabled) {
                                        defaultPipeline.sharpen.edgeAmount = this.editorPostProcessing.sharpEffectProperties.sharpEdgeAmount; // 0.3 by default
                                        defaultPipeline.sharpen.colorAmount = this.editorPostProcessing.sharpEffectProperties.sharpColorAmount; // 1 by default
                                        defaultPipeline.sharpen.adaptScaleToCurrentViewport = this.editorPostProcessing.sharpEffectProperties.adaptScaleViewport; // false by default
                                    }
                                }
                                else {
                                    BABYLON.SceneManager.LogWarning("Babylon.js default rendering pipeline not supported");
                                }
                                // ..
                                // Screen Space Ambient Occlusion
                                // ..
                                if (this.editorPostProcessing.screenSpaceRendering != null && this.editorPostProcessing.screenSpaceRendering.SSAO === true) {
                                    ssaoRatio = {
                                        ssaoRatio: this.editorPostProcessing.screenSpaceRendering.SSAORatio,
                                        combineRatio: this.editorPostProcessing.screenSpaceRendering.combineRatio // Ratio of the combine post-process (combines the SSAO and the scene)
                                    };
                                    PROJECT.DefaultCameraSystem.screenSpacePipeline = new BABYLON.SSAORenderingPipeline("DefaultCameraSystem-SSAO", this.scene, ssaoRatio, this.scene.cameras);
                                    if (PROJECT.DefaultCameraSystem.screenSpacePipeline.isSupported === true) {
                                        ssaoPipeline = PROJECT.DefaultCameraSystem.screenSpacePipeline;
                                        ssaoPipeline.fallOff = this.editorPostProcessing.screenSpaceRendering.fallOff;
                                        ssaoPipeline.area = this.editorPostProcessing.screenSpaceRendering.area;
                                        ssaoPipeline.radius = this.editorPostProcessing.screenSpaceRendering.radius;
                                        ssaoPipeline.totalStrength = this.editorPostProcessing.screenSpaceRendering.totalStrength;
                                        ssaoPipeline.base = this.editorPostProcessing.screenSpaceRendering.baseValue;
                                    }
                                    else {
                                        BABYLON.SceneManager.LogWarning("Babylon.js SSAO rendering pipeline not supported");
                                    }
                                }
                            }
                            //}
                            PROJECT.DefaultCameraSystem.cameraReady = true;
                            return [2 /*return*/];
                    }
                });
            });
        };
        DefaultCameraSystem.prototype.updateCameraSystemState = function () {
            if (this.m_cameraRig != null) {
                if (this.cameraType === 0) { // Default Universal Camera
                }
                else if (this.cameraType === 1) { // Augmented Reality Camera
                }
                else if (this.cameraType === 2) { // Virtual Reality Camera
                }
                else if (this.cameraType === 3) { // Multi Player Camera
                }
            }
        };
        DefaultCameraSystem.prototype.cleanCameraSystemState = function () {
            if (PROJECT.DefaultCameraSystem.PlayerOneCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerOneCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerOneCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerTwoCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerTwoCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerTwoCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerThreeCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerThreeCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerThreeCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerFourCamera != null) {
                //PROJECT.DefaultCameraSystem.PlayerFourCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerFourCamera = null;
            }
        };
        DefaultCameraSystem.prototype.destroyCameraSystemState = function () {
            this.immersiveOptions = null;
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Universal Camera Virtual Reality Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Get the WebXR default experience helper */
        DefaultCameraSystem.GetWebXR = function () { return PROJECT.DefaultCameraSystem.XRExperienceHelper; };
        /** Is universal camera system in WebXR mode */
        DefaultCameraSystem.IsInWebXR = function () { return (PROJECT.DefaultCameraSystem.XRExperienceHelper != null && PROJECT.DefaultCameraSystem.XRExperienceHelper.baseExperience != null && PROJECT.DefaultCameraSystem.XRExperienceHelper.baseExperience.state === BABYLON.WebXRState.IN_XR); };
        /** Setup navigation mesh for WebXR */
        DefaultCameraSystem.SetupNavigationWebXR = function (mesh, tag) {
            var webxr = PROJECT.DefaultCameraSystem.XRExperienceHelper;
            if (webxr != null && webxr.teleportation != null && mesh != null && tag != null && tag != "") {
                var hastag = BABYLON.Tags.MatchesQuery(mesh, tag);
                if (hastag === true)
                    webxr.teleportation.addFloorMesh(mesh);
            }
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Universal Camera System Player Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Get main camera rig for the scene */
        DefaultCameraSystem.GetMainCamera = function (scene, detach) {
            if (detach === void 0) { detach = false; }
            return PROJECT.DefaultCameraSystem.GetPlayerCamera(scene, BABYLON.PlayerNumber.One, detach);
        };
        /** Get universal camera rig for desired player */
        DefaultCameraSystem.GetPlayerCamera = function (scene, player, detach) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (detach === void 0) { detach = false; }
            var result = null;
            if (PROJECT.DefaultCameraSystem.IsCameraSystemReady()) {
                if (player === BABYLON.PlayerNumber.One && PROJECT.DefaultCameraSystem.PlayerOneCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerOneCamera;
                else if (player === BABYLON.PlayerNumber.Two && PROJECT.DefaultCameraSystem.PlayerTwoCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerTwoCamera;
                else if (player === BABYLON.PlayerNumber.Three && PROJECT.DefaultCameraSystem.PlayerThreeCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerThreeCamera;
                else if (player === BABYLON.PlayerNumber.Four && PROJECT.DefaultCameraSystem.PlayerFourCamera != null)
                    result = PROJECT.DefaultCameraSystem.PlayerFourCamera;
                if (result != null && detach === true && parent != null)
                    result.parent = null;
            }
            return result;
        };
        /** Get camera transform node for desired player */
        DefaultCameraSystem.GetCameraTransform = function (scene, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var result = null;
            if (PROJECT.DefaultCameraSystem.IsCameraSystemReady()) {
                if (player === BABYLON.PlayerNumber.One && PROJECT.DefaultCameraSystem.PlayerOneCamera != null && PROJECT.DefaultCameraSystem.PlayerOneCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerOneCamera.transform;
                else if (player === BABYLON.PlayerNumber.Two && PROJECT.DefaultCameraSystem.PlayerTwoCamera != null && PROJECT.DefaultCameraSystem.PlayerTwoCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerTwoCamera.transform;
                else if (player === BABYLON.PlayerNumber.Three && PROJECT.DefaultCameraSystem.PlayerThreeCamera != null && PROJECT.DefaultCameraSystem.PlayerThreeCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerThreeCamera.transform;
                else if (player === BABYLON.PlayerNumber.Four && PROJECT.DefaultCameraSystem.PlayerFourCamera != null && PROJECT.DefaultCameraSystem.PlayerFourCamera.transform != null)
                    result = PROJECT.DefaultCameraSystem.PlayerFourCamera.transform;
            }
            return result;
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Universal Camera System Multi Player Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Are stereo side side camera services available. */
        DefaultCameraSystem.IsStereoCameras = function () {
            return PROJECT.DefaultCameraSystem.stereoCameras;
        };
        /** Are local multi player view services available. */
        DefaultCameraSystem.IsMultiPlayerView = function () {
            return PROJECT.DefaultCameraSystem.multiPlayerView;
        };
        /** Get the current local multi player count */
        DefaultCameraSystem.GetMultiPlayerCount = function () {
            return PROJECT.DefaultCameraSystem.multiPlayerCount;
        };
        /** Activates current local multi player cameras. */
        DefaultCameraSystem.ActivateMultiPlayerCameras = function (scene) {
            var result = false;
            if (PROJECT.DefaultCameraSystem.multiPlayerCameras != null && PROJECT.DefaultCameraSystem.multiPlayerCameras.length > 0) {
                scene.activeCameras = PROJECT.DefaultCameraSystem.multiPlayerCameras;
                result = true;
            }
            return result;
        };
        /** Disposes current local multiplayer cameras */
        DefaultCameraSystem.DisposeMultiPlayerCameras = function () {
            if (PROJECT.DefaultCameraSystem.PlayerOneCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerOneCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerOneCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerTwoCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerTwoCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerTwoCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerThreeCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerThreeCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerThreeCamera = null;
            }
            if (PROJECT.DefaultCameraSystem.PlayerFourCamera != null) {
                PROJECT.DefaultCameraSystem.PlayerFourCamera.dispose();
                PROJECT.DefaultCameraSystem.PlayerFourCamera = null;
            }
        };
        /** Sets the multi player camera view layout */
        DefaultCameraSystem.SetMultiPlayerViewLayout = function (scene, totalNumPlayers) {
            var result = false;
            var players = BABYLON.Scalar.Clamp(totalNumPlayers, 1, 4);
            if (PROJECT.DefaultCameraSystem.IsMultiPlayerView()) {
                if (PROJECT.DefaultCameraSystem.PlayerOneCamera != null && PROJECT.DefaultCameraSystem.PlayerTwoCamera != null && PROJECT.DefaultCameraSystem.PlayerThreeCamera != null && PROJECT.DefaultCameraSystem.PlayerFourCamera != null) {
                    PROJECT.DefaultCameraSystem.multiPlayerCameras = [];
                    if (players === 1) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                    }
                    else if (players === 2) {
                        if (PROJECT.DefaultCameraSystem.stereoCameras === true) {
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0, 0.5, 1);
                            PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1);
                        }
                        else {
                            PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0.5, 1, 0.5);
                            PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0, 0, 1, 0.5);
                        }
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerTwoCamera);
                    }
                    else if (players === 3) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0, 0.5, 1);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(false);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerTwoCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerThreeCamera);
                    }
                    else if (players === 4) {
                        PROJECT.DefaultCameraSystem.PlayerOneCamera.viewport = new BABYLON.Viewport(0, 0.5, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.viewport = new BABYLON.Viewport(0, 0, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerTwoCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerThreeCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
                        PROJECT.DefaultCameraSystem.PlayerFourCamera.setEnabled(true);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerOneCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerTwoCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerThreeCamera);
                        PROJECT.DefaultCameraSystem.multiPlayerCameras.push(PROJECT.DefaultCameraSystem.PlayerFourCamera);
                    }
                    else {
                        BABYLON.SceneManager.LogWarning("Babylon.js camera rig invalid player count specified: " + players);
                    }
                }
                else {
                    BABYLON.SceneManager.LogWarning("Babylon.js camera rig failed to initialize multi player cameras");
                }
                PROJECT.DefaultCameraSystem.multiPlayerCount = players;
                result = PROJECT.DefaultCameraSystem.ActivateMultiPlayerCameras(scene);
                if (result === false)
                    BABYLON.SceneManager.LogWarning("Babylon.js camera rig failed to initialize multi player views");
            }
            else {
                BABYLON.SceneManager.LogWarning("Babylon.js camera rig multi player view option not enabled");
            }
            return result;
        };
        DefaultCameraSystem.PlayerOneCamera = null;
        DefaultCameraSystem.PlayerTwoCamera = null;
        DefaultCameraSystem.PlayerThreeCamera = null;
        DefaultCameraSystem.PlayerFourCamera = null;
        DefaultCameraSystem.XRExperienceHelper = null;
        DefaultCameraSystem.multiPlayerView = false;
        DefaultCameraSystem.multiPlayerCount = 1;
        DefaultCameraSystem.multiPlayerCameras = null;
        DefaultCameraSystem.stereoCameras = true;
        DefaultCameraSystem.startupMode = 1;
        DefaultCameraSystem.cameraReady = false;
        DefaultCameraSystem.renderingPipeline = null;
        DefaultCameraSystem.screenSpacePipeline = null;
        /** Register handler that is triggered when the webxr experience helper has been created */
        DefaultCameraSystem.OnXRExperienceHelperObservable = new BABYLON.Observable();
        return DefaultCameraSystem;
    }(BABYLON.ScriptComponent));
    PROJECT.DefaultCameraSystem = DefaultCameraSystem;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon Script Component
     * @class DebugInformation
     */
    var DebugInformation = /** @class */ (function (_super) {
        __extends(DebugInformation, _super);
        function DebugInformation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.keys = true;
            _this.show = true;
            _this.popup = false;
            _this.views = false;
            _this.xbox = false;
            _this.color = BABYLON.Color3.Green();
            return _this;
        }
        DebugInformation.prototype.awake = function () {
            this.keys = this.getProperty("enableDebugKeys", this.keys);
            this.show = this.getProperty("showDebugLabels", this.show);
            this.popup = this.getProperty("popupDebugPanel", this.popup);
            this.views = this.getProperty("togglePlayerViews", this.views);
            this.xbox = this.getProperty("allowXboxLiveSignIn", this.xbox);
            // ..
            var debugLabelColor = this.getProperty("debugOutputTextColor");
            if (debugLabelColor != null)
                this.color = BABYLON.Utilities.ParseColor3(debugLabelColor);
            // ..
            if (BABYLON.WindowManager.IsWindows())
                this.popup = false;
            BABYLON.SceneManager.LogMessage("Debug information overlay loaded");
        };
        DebugInformation.prototype.start = function () {
            var _this = this;
            //this.screen = document.getElementById("screen");
            //this.toggle = document.getElementById("toggle");
            //this.signin = document.getElementById("signin");
            //this.reload = document.getElementById("reload");
            //this.mouse = document.getElementById("mouse");
            //this.debug = document.getElementById("debug");
            if (this.show === true) {
                /*
                if (this.keys === true) {
                    if (!BABYLON.SceneManager.IsXboxOne()) {
                        if (this.screen) this.screen.innerHTML = "F - Show Full Screen";
                    }
                    if (BABYLON.CameraSystem.IsMultiPlayerView() && this.views === true) {
                        if (this.toggle) {
                            if (BABYLON.SceneManager.IsXboxOne()) {
                                this.toggle.style.top = "29px";
                            }
                            this.toggle.innerHTML = "1 - 4 Toggle Player View";
                        }
                    }
                    if (BABYLON.SceneManager.IsXboxLivePluginEnabled() && this.xbox === true) {
                        if (this.signin) {
                            if (BABYLON.SceneManager.IsXboxOne()) {
                                this.signin.style.top = "49px";
                            }
                            this.signin.innerHTML = "X - Xbox Live Sign In";
                        }
                    }
                    if (this.mouse) this.mouse.innerHTML = (BABYLON.SceneManager.IsXboxOne()) ? "M - Mouse" : "";
                    if (this.reload) this.reload.innerHTML = "R - Reload";
                    if (this.debug) this.debug.innerHTML = "P - Debug";
                }
                */
            }
            if (this.keys === true) {
                if (this.views === true) {
                    BABYLON.SceneManager.LogMessage("Enable Multiplayer Keys");
                    BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.Num1, function () {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(_this.scene, 1);
                        BABYLON.SceneManager.LogMessage("1 player pressed");
                    });
                    BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.Num2, function () {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(_this.scene, 2);
                        BABYLON.SceneManager.LogMessage("2 players pressed");
                    });
                    BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.Num3, function () {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(_this.scene, 3);
                        BABYLON.SceneManager.LogMessage("3 players pressed");
                    });
                    BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.Num4, function () {
                        PROJECT.DefaultCameraSystem.SetMultiPlayerViewLayout(_this.scene, 4);
                        BABYLON.SceneManager.LogMessage("4 players pressed");
                    });
                }
                BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.R, function () {
                    window.location.reload();
                });
                BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.I, function () {
                    if (_this.popup === true) {
                        BABYLON.WindowManager.PopupDebug(_this.scene);
                    }
                    else {
                        BABYLON.WindowManager.ToggleDebug(_this.scene, true, null);
                    }
                });
                BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.F, function () {
                    //BABYLON.SceneManager.ToggleFullScreenMode(this.scene);
                });
                /*
                if (BABYLON.SceneManager.IsXboxOne()) {
                    if (navigator.gamepadInputEmulation) {
                        BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.M, ()=>{
                            if (navigator.gamepadInputEmulation !== "mouse") {
                                navigator.gamepadInputEmulation = "mouse";
                            } else {
                                navigator.gamepadInputEmulation = "gamepad";
                            }
                        });
                    }
                } else {
                    BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.F, ()=>{
                        //BABYLON.Tools.RequestFullscreen(document.documentElement);
                        this.scene.getEngine().enterFullscreen(true);
                    });
                }
                if (BABYLON.WindowsPlatform.IsXboxLivePluginEnabled() && this.xbox === true) {
                    BABYLON.InputController.OnKeyboardPress(BABYLON.UserInputKey.X, ()=>{
                        var player:BABYLON.PlayerNumber.One = BABYLON.PlayerNumber.One;
                        if (!BABYLON.WindowsPlatform.IsXboxLiveUserSignedIn(null, player)) {
                            BABYLON.SceneManager.LogMessage("===> Trying Xbox Live Sign In For Player: " + player.toString());
                            BABYLON.WindowsPlatform.XboxLiveUserSignIn(player, (result: Microsoft.Xbox.Services.System.SignInResult) => {
                                var user = BABYLON.WindowsPlatform.GetXboxLiveUser(player);
                                var msg = "(" + user.xboxUserId + ") - " + user.gamertag;
                                BABYLON.SceneManager.AlertMessage(msg, "Xbox Live User Signed In");
                            }, (err)=>{
                                BABYLON.SceneManager.LogMessage(err);
                                var msg:string = "Encountered Sign Error";
                                BABYLON.SceneManager.LogWarning(msg);
                                BABYLON.SceneManager.AlertMessage(msg, "Xbox Live Warning");
                            });
                        } else {
                            BABYLON.SceneManager.LogWarning("Xbox Live User Already Signed In");
                            BABYLON.SceneManager.AlertMessage("User Already Signed In", "Xbox Live Warning");
                        }
                    });
                }
                */
            }
            // Default Print To Screen Text
            var printColor = (this.scene.getEngine().webGLVersion < 2) ? "red" : this.color.toHexString();
            var graphicsVersion = BABYLON.SceneManager.GetWebGLVersionString(this.scene);
            BABYLON.WindowManager.PrintToScreen(graphicsVersion, printColor);
        };
        DebugInformation.prototype.destroy = function () {
            //this.screen = null;
            //this.toggle = null;
            //this.signin = null;
            //this.reload = null;
            //this.mouse = null;
            //this.debug = null;
        };
        return DebugInformation;
    }(BABYLON.ScriptComponent));
    PROJECT.DebugInformation = DebugInformation;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialInstance
    */
    var NodeMaterialInstance = /** @class */ (function (_super) {
        __extends(NodeMaterialInstance, _super);
        function NodeMaterialInstance() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.nodeMaterialData = null;
            _this.setCustomRootUrl = null;
            _this.m_nodeMaterial = null;
            return _this;
        }
        NodeMaterialInstance.prototype.getMaterialInstance = function () { return this.m_nodeMaterial; };
        NodeMaterialInstance.prototype.awake = function () {
            if (this.nodeMaterialData != null) {
                var rootUrl = (this.setCustomRootUrl != null && this.setCustomRootUrl !== "") ? this.setCustomRootUrl.trim() : "";
                this.m_nodeMaterial = BABYLON.NodeMaterial.Parse(this.nodeMaterialData, this.scene, rootUrl);
                this.m_nodeMaterial.name = this.transform.name + ".NodeMaterial";
            }
        };
        NodeMaterialInstance.prototype.destroy = function () {
            if (this.m_nodeMaterial != null) {
                this.m_nodeMaterial.dispose();
                this.m_nodeMaterial = null;
            }
        };
        return NodeMaterialInstance;
    }(BABYLON.ScriptComponent));
    PROJECT.NodeMaterialInstance = NodeMaterialInstance;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialParticle
    */
    var NodeMaterialParticle = /** @class */ (function (_super) {
        __extends(NodeMaterialParticle, _super);
        function NodeMaterialParticle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.nodeMaterialEditor = null;
            return _this;
        }
        NodeMaterialParticle.prototype.awake = function () {
            /* Init component function */
        };
        NodeMaterialParticle.prototype.start = function () {
            if (this.nodeMaterialEditor != null) {
                var nme = SM.FindScriptComponent(this.nodeMaterialEditor, "PROJECT.NodeMaterialInstance");
                if (nme != null) {
                    var materialInstance = nme.getMaterialInstance();
                    if (materialInstance != null) {
                        this.setupNodeMaterial(materialInstance);
                    }
                    else {
                        console.warn("Null node material instance on: " + this.nodeMaterialEditor.name);
                    }
                }
                else {
                    console.warn("Failed to locate node material editor on: " + this.nodeMaterialEditor.name);
                }
            }
        };
        NodeMaterialParticle.prototype.setupNodeMaterial = function (materialInstance) {
        };
        NodeMaterialParticle.prototype.update = function () {
            /* Update render loop function */
        };
        NodeMaterialParticle.prototype.late = function () {
            /* Late update render loop function */
        };
        NodeMaterialParticle.prototype.after = function () {
            /* After update render loop function */
        };
        NodeMaterialParticle.prototype.fixed = function () {
            /* Fixed update physics step function */
        };
        NodeMaterialParticle.prototype.ready = function () {
            /* Execute when scene is ready function */
        };
        NodeMaterialParticle.prototype.destroy = function () {
            this.nodeMaterialEditor = null;
        };
        return NodeMaterialParticle;
    }(BABYLON.ScriptComponent));
    PROJECT.NodeMaterialParticle = NodeMaterialParticle;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialProcess
    */
    var NodeMaterialProcess = /** @class */ (function (_super) {
        __extends(NodeMaterialProcess, _super);
        function NodeMaterialProcess() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.nodeMaterialEditor = null;
            _this.numberOfSamples = 1;
            _this.samplingMode = 0;
            _this.textureType = 0;
            _this.textureFormat = BABYLON.Constants.TEXTUREFORMAT_RGBA;
            _this.sizeRatio = 1.0;
            _this.resuable = false;
            _this.m_postProcess = null;
            return _this;
        }
        NodeMaterialProcess.prototype.getPostProcess = function () { return this.m_postProcess; };
        NodeMaterialProcess.prototype.start = function () {
            if (this.nodeMaterialEditor != null) {
                var nme = SM.FindScriptComponent(this.nodeMaterialEditor, "PROJECT.NodeMaterialInstance");
                if (nme != null) {
                    var materialInstance = nme.getMaterialInstance();
                    if (materialInstance != null) {
                        this.setupNodeMaterial(materialInstance);
                    }
                    else {
                        console.warn("Null node material instance on: " + this.nodeMaterialEditor.name);
                    }
                }
                else {
                    console.warn("Failed to locate node material editor on: " + this.nodeMaterialEditor.name);
                }
            }
        };
        NodeMaterialProcess.prototype.setupNodeMaterial = function (materialInstance) {
            var camera = this.getCameraRig();
            if (camera != null) {
                this.m_postProcess = materialInstance.createPostProcess(camera, this.sizeRatio, this.samplingMode, this.scene.getEngine(), this.resuable, this.textureType, this.textureFormat);
                if (this.m_postProcess != null) {
                    this.m_postProcess.name = (this.transform.name + ".Process");
                    this.m_postProcess.samples = this.numberOfSamples;
                }
                else {
                    console.warn("Failed to create post process for: " + this.transform.name);
                }
            }
            else {
                console.warn("Null camera rig for: " + this.transform.name);
            }
        };
        NodeMaterialProcess.prototype.destroy = function () {
            this.nodeMaterialEditor = null;
            if (this.m_postProcess != null) {
                this.m_postProcess.dispose();
                this.m_postProcess = null;
            }
        };
        return NodeMaterialProcess;
    }(BABYLON.ScriptComponent));
    PROJECT.NodeMaterialProcess = NodeMaterialProcess;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class NodeMaterialTexture
    */
    var NodeMaterialTexture = /** @class */ (function (_super) {
        __extends(NodeMaterialTexture, _super);
        function NodeMaterialTexture() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.nodeMaterialEditor = null;
            _this.textureSize = 256;
            _this.m_proceduralTexture = null;
            return _this;
        }
        NodeMaterialTexture.prototype.getProceduralTexture = function () { return this.m_proceduralTexture; };
        NodeMaterialTexture.prototype.start = function () {
            if (this.nodeMaterialEditor != null) {
                var nme = SM.FindScriptComponent(this.nodeMaterialEditor, "PROJECT.NodeMaterialInstance");
                if (nme != null) {
                    var materialInstance = nme.getMaterialInstance();
                    if (materialInstance != null) {
                        this.setupNodeMaterial(materialInstance);
                    }
                    else {
                        console.warn("Null node material instance on: " + this.nodeMaterialEditor.name);
                    }
                }
                else {
                    console.warn("Failed to locate node material editor on: " + this.nodeMaterialEditor.name);
                }
            }
        };
        NodeMaterialTexture.prototype.setupNodeMaterial = function (materialInstance) {
            this.m_proceduralTexture = materialInstance.createProceduralTexture(this.textureSize, this.scene);
            if (this.m_proceduralTexture != null) {
                this.m_proceduralTexture.name = (this.transform.name + ".Texture");
            }
        };
        NodeMaterialTexture.prototype.destroy = function () {
            this.nodeMaterialEditor = null;
            if (this.m_proceduralTexture != null) {
                this.m_proceduralTexture.dispose();
                this.m_proceduralTexture = null;
            }
        };
        return NodeMaterialTexture;
    }(BABYLON.ScriptComponent));
    PROJECT.NodeMaterialTexture = NodeMaterialTexture;
})(PROJECT || (PROJECT = {}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class MobileInputController
    */
    var MobileInputController = /** @class */ (function (_super) {
        __extends(MobileInputController, _super);
        function MobileInputController() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.controlType = 0;
            _this.sideMargins = 16;
            _this.bottomMargins = 16;
            _this.readyTimeout = 200;
            _this.invertLeftStickY = true;
            _this.invertRightStickY = true;
            _this.enableLeftJoystick = true;
            _this.enableRightJoystick = true;
            _this.disableMouseRotation = true;
            _this.updateCameraInput = false;
            _this.m_leftStick = null;
            _this.m_rightStick = null;
            return _this;
        }
        MobileInputController.prototype.getLeftStick = function () { return this.m_leftStick; };
        MobileInputController.prototype.getRightStick = function () { return this.m_rightStick; };
        MobileInputController.prototype.getLeftStickEnabled = function () { return this.enableLeftJoystick; };
        MobileInputController.prototype.getRightStickEnabled = function () { return this.enableRightJoystick; };
        MobileInputController.prototype.start = function () {
            if (this.updateCameraInput === true) {
                var camera = PROJECT.DefaultCameraSystem.GetMainCamera(this.scene);
                if (camera != null) {
                    var input = new PROJECT.FreeCameraTouchJoystickInput();
                    input.controller = this;
                    input.invertYAxis = !this.invertRightStickY;
                    camera.inputs.add(input);
                }
            }
        };
        MobileInputController.prototype.ready = function () {
            var _this = this;
            if (this.controlType === 1 || BABYLON.WindowManager.IsMobile()) {
                if (this.disableMouseRotation === true)
                    BABYLON.SceneManager.VirtualJoystickEnabled = true; // Note: If Using Joystick Rotation Then Disable Mouse Input
                var displayTimeout = (this.readyTimeout >= 10) ? this.readyTimeout : 10;
                BABYLON.SceneManager.SetTimeout(displayTimeout, function () {
                    _this.createHtmlElements();
                    if (_this.enableLeftJoystick === true)
                        _this.m_leftStick = new BABYLON.TouchJoystickHandler("stick1", 64, 8);
                    if (_this.enableRightJoystick === true)
                        _this.m_rightStick = new BABYLON.TouchJoystickHandler("stick2", 64, 8);
                });
            }
        };
        MobileInputController.prototype.update = function () {
            if (this.enableLeftJoystick === true && this.m_leftStick != null) {
                var leftStickValueX = this.m_leftStick.getValueX();
                var leftStickValueY = this.m_leftStick.getValueY();
                BABYLON.InputController.SetLeftJoystickBuffer(leftStickValueX, leftStickValueY, this.invertLeftStickY);
            }
            if (this.enableRightJoystick === true && this.m_rightStick != null) {
                var rightStickValueX = this.m_rightStick.getValueX();
                var rightStickValueY = this.m_rightStick.getValueY();
                BABYLON.InputController.SetRightJoystickBuffer(rightStickValueX, rightStickValueY, this.invertRightStickY);
            }
        };
        MobileInputController.prototype.destroy = function () {
            if (this.m_leftStick != null) {
                this.m_leftStick.dispose();
                this.m_leftStick = null;
            }
            if (this.m_rightStick != null) {
                this.m_rightStick.dispose();
                this.m_rightStick = null;
            }
        };
        MobileInputController.prototype.createHtmlElements = function () {
            var rootUrl = BABYLON.SceneManager.GetRootUrl(this.scene);
            var baseImageData = this.getProperty("joystickBaseImage");
            var leftStickImageData = this.getProperty("leftStickImage");
            var rightStickImageData = this.getProperty("rightStickImage");
            var baseImageFilename = (baseImageData != null) ? baseImageData.filename : "baseImage.png";
            var leftStickImageFilename = (leftStickImageData != null) ? leftStickImageData.filename : "leftStick.png";
            var rightStickImageFilename = (rightStickImageData != null) ? rightStickImageData.filename : "rightStick.png";
            // ..
            // style="border: 1px solid red; width: 128px; position: absolute; left:20px; bottom:20px;"
            // ..
            if (this.enableLeftJoystick === true) {
                var baseDiv1 = document.createElement("div");
                baseDiv1.id = "base1";
                baseDiv1.style.width = "128px";
                baseDiv1.style.position = "absolute";
                baseDiv1.style.left = (this.sideMargins.toFixed(0) + "px");
                baseDiv1.style.bottom = (this.bottomMargins.toFixed(0) + "px");
                var baseImg1 = document.createElement("img");
                baseImg1.id = "image1";
                baseImg1.src = (rootUrl + baseImageFilename);
                var ballDiv1 = document.createElement("div");
                ballDiv1.id = "stick1";
                ballDiv1.style.position = "absolute";
                ballDiv1.style.top = "32px";
                ballDiv1.style.left = "32px";
                var ballImg1 = document.createElement("img");
                ballImg1.id = "ball1";
                ballImg1.src = (rootUrl + leftStickImageFilename);
                baseDiv1.appendChild(baseImg1);
                ballDiv1.appendChild(ballImg1);
                baseDiv1.appendChild(ballDiv1);
                document.body.appendChild(baseDiv1);
            }
            // ..
            // style="border: 1px solid blue; width: 128px; position: absolute; right:20px; bottom:20px;"
            // ..
            if (this.enableRightJoystick === true) {
                var baseDiv2 = document.createElement("div");
                baseDiv2.id = "base2";
                baseDiv2.style.width = "128px";
                baseDiv2.style.position = "absolute";
                baseDiv2.style.right = (this.sideMargins.toFixed(0) + "px");
                baseDiv2.style.bottom = (this.bottomMargins.toFixed(0) + "px");
                var baseImg2 = document.createElement("img");
                baseImg2.id = "image2";
                baseImg2.src = (rootUrl + baseImageFilename);
                var ballDiv2 = document.createElement("div");
                ballDiv2.id = "stick2";
                ballDiv2.style.position = "absolute";
                ballDiv2.style.top = "32px";
                ballDiv2.style.left = "32px";
                var ballImg2 = document.createElement("img");
                ballImg2.id = "ball2";
                ballImg2.src = (rootUrl + rightStickImageFilename);
                baseDiv2.appendChild(baseImg2);
                ballDiv2.appendChild(ballImg2);
                baseDiv2.appendChild(ballDiv2);
                document.body.appendChild(baseDiv2);
            }
        };
        return MobileInputController;
    }(BABYLON.ScriptComponent));
    PROJECT.MobileInputController = MobileInputController;
    /**
     * Manage the joystick inputs to control a free camera.
     * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
     */
    var FreeCameraTouchJoystickInput = /** @class */ (function () {
        function FreeCameraTouchJoystickInput() {
            /**
             * Defines the joystick rotation sensiblity.
             * This is the threshold from when rotation starts to be accounted for to prevent jittering.
             */
            this.joystickAngularSensibility = 200;
            /**
             * Defines the joystick move sensiblity.
             * This is the threshold from when moving starts to be accounted for for to prevent jittering.
             */
            this.joystickMoveSensibility = 40.0;
            /**
             * Defines the minimum value at which any analog stick input is ignored.
             * Note: This value should only be a value between 0 and 1.
             */
            this.deadzoneDelta = 0.1;
            this._yAxisScale = 1.0;
            // private members
            this.LSValues = new BABYLON.Vector2(0, 0);
            this.RSValues = new BABYLON.Vector2(0, 0);
            this._cameraTransform = BABYLON.Matrix.Identity();
            this._deltaTransform = BABYLON.Vector3.Zero();
            this._vector3 = BABYLON.Vector3.Zero();
            this._vector2 = BABYLON.Vector2.Zero();
            this._attached = false;
        }
        Object.defineProperty(FreeCameraTouchJoystickInput.prototype, "invertYAxis", {
            /**
             * Gets or sets a boolean indicating that Yaxis (for right stick) should be inverted
             */
            get: function () { return this._yAxisScale !== 1.0; },
            set: function (value) { this._yAxisScale = value ? -1.0 : 1.0; },
            enumerable: false,
            configurable: true
        });
        /**
         * Attach the input controls to a specific dom element to get the input from.
         */
        FreeCameraTouchJoystickInput.prototype.attachControl = function () {
            this._attached = true;
        };
        /**
         * Detach the current controls from the specified dom element.
         * @param ignored defines an ignored parameter kept for backward compatibility. If you want to define the source input element, you can set engine.inputElement before calling camera.attachControl
         */
        FreeCameraTouchJoystickInput.prototype.detachControl = function (ignored) {
            this._attached = false;
        };
        /**
         * Update the current camera state depending on the inputs that have been used this frame.
         * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
         */
        FreeCameraTouchJoystickInput.prototype.checkInputs = function () {
            if (this.camera != null && this.controller != null && this._attached === true) {
                var LStick = this.controller.getLeftStick();
                if (LStick != null) {
                    this.LSValues.set(LStick.getValueX(), LStick.getValueY());
                    if (this.joystickMoveSensibility !== 0) {
                        this.LSValues.x = (Math.abs(this.LSValues.x) > this.deadzoneDelta) ? this.LSValues.x / this.joystickMoveSensibility : 0;
                        this.LSValues.y = (Math.abs(this.LSValues.y) > this.deadzoneDelta) ? this.LSValues.y / this.joystickMoveSensibility : 0;
                    }
                }
                else {
                    this.LSValues.set(0, 0);
                }
                // ..
                var RStick = this.controller.getRightStick();
                if (RStick != null) {
                    this.RSValues.set(RStick.getValueX(), RStick.getValueY());
                    if (this.joystickAngularSensibility !== 0) {
                        this.RSValues.x = (Math.abs(this.RSValues.x) > this.deadzoneDelta) ? this.RSValues.x / this.joystickAngularSensibility : 0;
                        this.RSValues.y = ((Math.abs(this.RSValues.y) > this.deadzoneDelta) ? this.RSValues.y / this.joystickAngularSensibility : 0) * this._yAxisScale;
                    }
                }
                else {
                    this.RSValues.set(0, 0);
                }
                // ..
                if (!this.camera.rotationQuaternion) {
                    BABYLON.Matrix.RotationYawPitchRollToRef(this.camera.rotation.y, this.camera.rotation.x, 0, this._cameraTransform);
                }
                else {
                    this.camera.rotationQuaternion.toRotationMatrix(this._cameraTransform);
                }
                // ..
                var speed = this.camera._computeLocalCameraSpeed() * 50.0;
                this._vector3.copyFromFloats(this.LSValues.x * speed, 0, -this.LSValues.y * speed);
                // ..
                BABYLON.Vector3.TransformCoordinatesToRef(this._vector3, this._cameraTransform, this._deltaTransform);
                this.camera.cameraDirection.addInPlace(this._deltaTransform);
                this._vector2.copyFromFloats(this.RSValues.y, this.RSValues.x);
                this.camera.cameraRotation.addInPlace(this._vector2);
            }
        };
        /**
         * Gets the class name of the current input.
         * @returns the class name
         */
        FreeCameraTouchJoystickInput.prototype.getClassName = function () {
            return "FreeCameraTouchJoystickInput";
        };
        /**
         * Get the friendly name associated with the input class.
         * @returns the input friendly name
         */
        FreeCameraTouchJoystickInput.prototype.getSimpleName = function () {
            return "joystick";
        };
        __decorate([
            BABYLON.serialize()
        ], FreeCameraTouchJoystickInput.prototype, "joystickAngularSensibility", void 0);
        __decorate([
            BABYLON.serialize()
        ], FreeCameraTouchJoystickInput.prototype, "joystickMoveSensibility", void 0);
        return FreeCameraTouchJoystickInput;
    }());
    PROJECT.FreeCameraTouchJoystickInput = FreeCameraTouchJoystickInput;
    BABYLON.CameraInputTypes["FreeCameraTouchJoystickInput"] = PROJECT.FreeCameraTouchJoystickInput;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon toolkit standard player controller class
     * @class StandardPlayerController - All rights reserved (c) 2020 Mackey Kinard
    */
    var StandardPlayerController = /** @class */ (function (_super) {
        __extends(StandardPlayerController, _super);
        function StandardPlayerController(transform, scene, properties) {
            var _this = _super.call(this, transform, scene, properties) || this;
            _this.enableInput = false;
            _this.attachCamera = false;
            _this.rotateCamera = true;
            _this.toggleView = true;
            _this.freeLooking = false;
            _this.requireSprintButton = false;
            _this.gravitationalForce = 29.4;
            _this.terminalVelocity = 55.0;
            _this.minFallVelocity = 1.0;
            _this.airbornTimeout = 0.1;
            _this.normalAngle = 0.6;
            _this.radiusScale = 0.5;
            _this.rayLength = 10;
            _this.rayOrigin = 1;
            _this.maxAngle = 45;
            _this.speedFactor = 1.0;
            _this.moveSpeed = 6.0;
            _this.lookSpeed = 2.0;
            _this.jumpSpeed = 10.0;
            _this.jumpDelay = 0.75;
            _this.jumpAllowed = true;
            _this.eyesHeight = 1.0;
            _this.pivotHeight = 1.0;
            _this.topLookLimit = 60.0;
            _this.downLookLimit = 30.0;
            _this.lowTurnSpeed = 15.0;
            _this.highTurnSpeed = 25.0;
            // DEPRECIATED: public smoothingSpeed:number = 0.12;
            _this.smoothAcceleration = false;
            _this.accelerationSpeed = 0.1;
            _this.decelerationSpeed = 0.1;
            _this.avatarSkinTag = "Skin";
            _this.climbVolumeTag = "Climb";
            _this.distanceFactor = 0.85;
            _this.cameraSmoothing = 5;
            _this.cameraCollisions = true;
            _this.inputMagnitude = 0;
            _this.landingEpsilon = 0.1;
            _this.minimumDistance = 0.85;
            _this.playerInputX = 0;
            _this.playerInputZ = 0;
            _this.playerMouseX = 0;
            _this.playerMouseY = 0;
            _this.canSpecialJump = null;
            _this.ignoreTriggerTags = null;
            _this.buttonJump = BABYLON.Xbox360Button.A;
            _this.keyboardJump = BABYLON.UserInputKey.SpaceBar;
            _this.buttonSprint = BABYLON.Xbox360Button.LeftStick;
            _this.keyboardSprint = BABYLON.UserInputKey.Shift;
            _this.buttonCamera = BABYLON.Xbox360Button.Y;
            _this.keyboardCamera = BABYLON.UserInputKey.P;
            _this.sprintThresholdSpeed = 1.0;
            _this.playerNumber = BABYLON.PlayerNumber.One;
            _this.boomPosition = new BABYLON.Vector3(0, 0, 0);
            _this.airbornVelocity = new BABYLON.Vector3(0, 0, 0);
            _this.movementVelocity = new BABYLON.Vector3(0, 0, 0);
            _this.targetCameraOffset = new BABYLON.Vector3(0, 0, 0);
            _this.rayClimbLength = 2.0;
            _this.rayClimbOffset = 1.0;
            _this.abstractMesh = null;
            _this.cameraDistance = 0;
            _this.forwardCamera = false;
            _this.avatarRadius = 0.5;
            _this.dollyDirection = new BABYLON.Vector3(0, 0, 0);
            _this.cameraEulers = new BABYLON.Vector3(0, 0, 0);
            _this.rotationEulers = new BABYLON.Vector3(0, 0, 0);
            _this.cameraPivotOffset = new BABYLON.Vector3(0, 0, 0);
            _this.cameraForwardVector = new BABYLON.Vector3(0, 0, 0);
            _this.cameraRightVector = new BABYLON.Vector3(0, 0, 0);
            _this.desiredForwardVector = new BABYLON.Vector3(0, 0, 0);
            _this.desiredRightVector = new BABYLON.Vector3(0, 0, 0);
            _this.scaledCamDirection = new BABYLON.Vector3(0, 0, 0);
            _this.scaledMaxDirection = new BABYLON.Vector3(0, 0, 0);
            _this.parentNodePosition = new BABYLON.Vector3(0, 0, 0);
            _this.maximumCameraPos = new BABYLON.Vector3(0, 0, 0);
            _this.tempWorldPosition = new BABYLON.Vector3(0, 0, 0);
            _this.cameraRaycastShape = null;
            _this.defaultRaycastGroup = BABYLON.CollisionFilters.DefaultFilter;
            _this.defaultRaycastMask = BABYLON.CollisionFilters.StaticFilter;
            _this.cameraRaycastMask = (BABYLON.CollisionFilters.AllFilter ^ BABYLON.CollisionFilters.CharacterFilter); // Note: Exclude The Player Character Controller From Camera Collision
            _this.avatarSkins = null;
            _this.cameraNode = null;
            _this.cameraPivot = null;
            _this.navigationAgent = null;
            _this.characterController = null;
            _this.verticalVelocity = 0;
            _this.movementSpeed = 0;
            _this.isJumpPressed = false;
            _this.isSprintPressed = false;
            _this.isCharacterSliding = false;
            _this.isCharacterFalling = false;
            _this.isCharacterGrounded = false;
            _this.isCharacterFallTriggered = false;
            _this.isCharacterJumpFrame = false;
            _this.isCharacterJumping = false;
            _this.isCharacterJumpSpecial = false;
            _this.isCharacterNavigating = false;
            _this.navigationAngularSpeed = 0;
            _this.updateStateParams = true;
            _this.animationStateParams = null;
            _this.sphereCollisionShape = null;
            _this.showDebugColliders = false;
            _this.colliderVisibility = 0;
            _this.colliderRenderGroup = 0;
            _this.deltaTime = 0;
            _this.minJumpTimer = 0;
            _this.delayJumpTimer = 0;
            _this.playerControl = 0;
            _this.moveWithCollision = true;
            _this.animationState = null;
            // DEPRECIATED: private rotationVelocityX:BABYLON.Vector2 = new BABYLON.Vector2(0,0);
            // DEPRECIATED: private rotationVelocityY:BABYLON.Vector2 = new BABYLON.Vector2(0,0);
            _this.lastJumpVelocity = new BABYLON.Vector3(0, 0, 0);
            _this.inputMovementVector = new BABYLON.Vector3(0, 0, 0);
            _this.playerLookRotation = new BABYLON.Vector3(0, 0, 0);
            _this.playerRotationVector = BABYLON.Vector2.Zero();
            _this.playerMovementVelocity = new BABYLON.Vector3(0, 0, 0);
            _this.playerRotationQuaternion = BABYLON.Quaternion.Zero();
            _this.playerMoveDirection = PROJECT.PlayerMoveDirection.Stationary;
            _this.groundHit = false;
            _this.groundNode = null;
            _this.groundAngle = 0;
            _this.groundPoint = new BABYLON.Vector3(0, 0, 0);
            _this.groundNormal = new BABYLON.Vector3(0, 0, 0);
            _this.groundDistance = 0;
            _this.groundCollision = false;
            _this.groundVelocity = 0;
            _this.groundSensorLine = null;
            _this.offsetGroundRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            _this.startGroundRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            _this.endGroundRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            _this.downDirection = new BABYLON.Vector3(0, -1, 0);
            _this.climbContact = false;
            _this.climbContactNode = null;
            _this.climbContactAngle = 0;
            _this.climbContactPoint = new BABYLON.Vector3(0, 0, 0);
            _this.climbContactNormal = new BABYLON.Vector3(0, 0, 0);
            _this.climbContactDistance = 0;
            _this.climbSensorLine = null;
            _this.offsetClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            _this.startClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            _this.endClimbRaycastPosition = new BABYLON.Vector3(0, 0, 0);
            _this.forwardDirection = new BABYLON.Vector3(0, 0, 1);
            _this.m_velocityOffset = new BABYLON.Vector3(0, 0, 0);
            _this.m_actualVelocity = new BABYLON.Vector3(0, 0, 0);
            _this.m_linearVelocity = new BABYLON.Vector3(0, 0, 0);
            _this.m_lastPosition = new BABYLON.Vector3(0, 0, 0);
            _this.m_positionCenter = new BABYLON.Vector3(0, 0, 0);
            _this.m_scaledVelocity = 0;
            _this.playerDrawVelocity = 0;
            /** Register handler that is triggered before the controller has been updated */
            _this.onPreUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered before the controller movement has been applied */
            _this.onBeforeMoveObservable = new BABYLON.Observable();
            /** Register handler that is triggered after the controller has been updated */
            _this.onPostUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered after player input has been updated */
            _this.onPlayerInputObservable = new BABYLON.Observable();
            _this._ikLeftController = null;
            _this._ikLeftFootTarget = null;
            _this._ikLeftPoleTarget = null;
            _this._ikRightController = null;
            _this._ikRightFootTarget = null;
            _this._ikRightPoleTarget = null;
            _this.abstractSkinMesh = null;
            _this.rootBoneTransform = null;
            _this.leftFootTransform = null;
            //private leftFootPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            _this.leftFootPolePos = new BABYLON.Vector3(0, 0, 0);
            _this.leftFootBendAxis = new BABYLON.Vector3(1, 0, 0);
            _this.leftFootPoleAngle = 0;
            _this.leftFootMaxAngle = 180;
            _this.rightFootTransform = null;
            //private rightFootPosition:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            _this.rightFootPolePos = new BABYLON.Vector3(0, 0, 0);
            _this.rightFootBendAxis = new BABYLON.Vector3(1, 0, 0);
            _this.rightFootPoleAngle = 0;
            _this.rightFootMaxAngle = 180;
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //  Non Physics Raycasting
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            _this.pickingRay = null;
            _this.pickingHelper = null;
            _this.pickingOrigin = null;
            _this.pickingDirection = new BABYLON.Vector3(0, -1, 0);
            _this.climbingRay = null;
            _this.climbingHelper = null;
            _this.climbingOrigin = null;
            _this.climbingDirection = new BABYLON.Vector3(0, 0, 1);
            _this.cameraRay = null;
            _this.cameraHelper = null;
            _this.cameraForward = new BABYLON.Vector3(0, 0, 0);
            _this.cameraDirection = new BABYLON.Vector3(0, 0, 0);
            return _this;
        }
        StandardPlayerController.prototype.isAnimationEnabled = function () { return this.updateStateParams; };
        StandardPlayerController.prototype.isJumpButtonPressed = function () { return this.isJumpPressed; };
        StandardPlayerController.prototype.isSprintButtonPressed = function () { return this.isSprintPressed; };
        StandardPlayerController.prototype.getSpecialJumped = function () { return this.isCharacterJumpSpecial; };
        StandardPlayerController.prototype.getPlayerJumped = function () { return this.isCharacterJumpFrame; };
        StandardPlayerController.prototype.getPlayerJumping = function () { return this.isCharacterJumping; };
        StandardPlayerController.prototype.getPlayerFalling = function () { return this.isCharacterFalling; };
        StandardPlayerController.prototype.getPlayerSliding = function () { return this.isCharacterSliding; };
        StandardPlayerController.prototype.getPlayerGrounded = function () { return this.isCharacterGrounded; };
        StandardPlayerController.prototype.getFallTriggered = function () { return this.isCharacterFallTriggered; };
        StandardPlayerController.prototype.getMovementSpeed = function () { return this.movementSpeed; };
        StandardPlayerController.prototype.getCameraBoomNode = function () { return this.cameraNode; };
        StandardPlayerController.prototype.getCameraTransform = function () { return this.cameraPivot; };
        StandardPlayerController.prototype.getAnimationState = function () { return this.animationState; };
        StandardPlayerController.prototype.getVerticalVelocity = function () { return this.getCheckedVerticalVelocity(); };
        StandardPlayerController.prototype.getCharacterController = function () { return this.characterController; };
        StandardPlayerController.prototype.getPlayerMoveDirection = function () { return this.playerMoveDirection; };
        StandardPlayerController.prototype.getInputMovementVector = function () { return this.inputMovementVector; };
        StandardPlayerController.prototype.getInputMagnitudeValue = function () { return this.inputMagnitude; };
        StandardPlayerController.prototype.getCameraPivotPosition = function () { return (this.cameraPivot != null) ? this.cameraPivot.position : null; };
        StandardPlayerController.prototype.getCameraPivotRotation = function () { return (this.cameraPivot != null) ? this.cameraPivot.rotationQuaternion : null; };
        StandardPlayerController.prototype.getGroundHit = function () { return this.groundHit; };
        StandardPlayerController.prototype.getGroundNode = function () { return this.groundNode; };
        StandardPlayerController.prototype.getGroundPoint = function () { return this.groundPoint; };
        StandardPlayerController.prototype.getGroundAngle = function () { return this.groundAngle; };
        StandardPlayerController.prototype.getGroundNormal = function () { return this.groundNormal; };
        StandardPlayerController.prototype.getGroundDistance = function () { return this.groundDistance; };
        StandardPlayerController.prototype.getGroundCollision = function () { return this.groundCollision; };
        StandardPlayerController.prototype.getClimbContact = function () { return this.climbContact; };
        StandardPlayerController.prototype.getClimbContactNode = function () { return this.climbContactNode; };
        StandardPlayerController.prototype.getClimbContactPoint = function () { return this.climbContactPoint; };
        StandardPlayerController.prototype.getClimbContactAngle = function () { return this.climbContactAngle; };
        StandardPlayerController.prototype.getClimbContactNormal = function () { return this.climbContactNormal; };
        StandardPlayerController.prototype.getClimbContactDistance = function () { return this.climbContactDistance; };
        ;
        StandardPlayerController.prototype.setGavityForce = function (gravity) {
            this.gravitationalForce = gravity;
            if (this.characterController != null) {
                this.characterController.setGravity(this.gravitationalForce);
            }
        };
        StandardPlayerController.prototype.setTerminalVelocity = function (velocity) {
            this.terminalVelocity = velocity;
            if (this.characterController != null) {
                this.characterController.setFallingSpeed(this.terminalVelocity);
            }
        };
        StandardPlayerController.prototype.awake = function () { this.awakePlayerController(); };
        StandardPlayerController.prototype.start = function () { this.startPlayerController(); };
        StandardPlayerController.prototype.update = function () { this.updatePlayerController(); };
        StandardPlayerController.prototype.destroy = function () { this.destroyPlayerController(); };
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Controller Attachment Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /** Set the player world position */
        StandardPlayerController.prototype.setWorldPosition = function (x, y, z) {
            if (this.characterController != null) {
                this.characterController.set(x, y, z);
            }
            else {
                this.tempWorldPosition.set(x, y, z);
                this.transform.setAbsolutePosition(this.tempWorldPosition);
            }
        };
        /** TODO */
        StandardPlayerController.prototype.setPlayerControl = function (mode) {
            this.playerControl = mode;
            if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonTurning || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonForward) {
                this.showAvatarSkins(true);
            }
            else {
                this.showAvatarSkins(false);
            }
            if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonForward) {
                this.forwardCamera = true;
            }
            else if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonTurning) {
                this.forwardCamera = false;
            }
        };
        /** TODO */
        StandardPlayerController.prototype.togglePlayerControl = function () {
            if (this.toggleView === true) {
                if (this.playerControl === PROJECT.PlayerInputControl.FirstPersonStrafing) {
                    if (this.forwardCamera === true) {
                        this.setPlayerControl(PROJECT.PlayerInputControl.ThirdPersonForward);
                    }
                    else {
                        this.setPlayerControl(PROJECT.PlayerInputControl.ThirdPersonStrafing); // TODO: Include Turning Toggle
                    }
                }
                else {
                    this.setPlayerControl(PROJECT.PlayerInputControl.FirstPersonStrafing);
                }
            }
        };
        StandardPlayerController.prototype.showAvatarSkins = function (show) {
            if (this.avatarSkins != null) {
                // TODO - Make Skins Visible Or Not TO Camera But Keep Shadows - ???
                this.avatarSkins.forEach(function (skin) { skin.isVisible = show; });
            }
        };
        /** TODO */
        StandardPlayerController.prototype.attachPlayerCamera = function (player) {
            if (this.cameraNode == null) {
                var playerCamera = (player <= 0 || player > 4) ? 1 : player;
                this.cameraNode = PROJECT.DefaultCameraSystem.GetCameraTransform(this.scene, playerCamera);
                if (this.cameraNode != null) {
                    this.cameraNode.parent = this.cameraPivot;
                    this.cameraNode.position.copyFrom(this.boomPosition);
                    this.cameraNode.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                    // ..
                    // const actualCamera:BABYLON.UniversalCamera = SM.FindSceneCameraRig(this.cameraNode) as BABYLON.UniversalCamera;
                    // if (actualCamera != null) actualCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(BABYLON.Tools.ToRadians(30),0,0);
                    // ..
                    // TODO - Move somewhere better - ???
                    // TODO - Handle Long Intitial Camera Pan - ???
                    // ..
                    this.cameraDistance = this.cameraNode.position.length();
                    this.dollyDirection.copyFrom(this.cameraNode.position);
                    this.dollyDirection.normalize();
                }
                else {
                    // DEBUG: BABYLON.SceneManager.LogWarning("Failed to locate player camera for: " + this.transform.name);
                }
            }
        };
        StandardPlayerController.prototype.getLeftFootTarget = function () { return this._ikLeftFootTarget; };
        StandardPlayerController.prototype.getRightFootTarget = function () { return this._ikRightFootTarget; };
        StandardPlayerController.prototype.getLeftFootController = function () { return this._ikLeftController; };
        StandardPlayerController.prototype.getRightFootController = function () { return this._ikRightController; };
        StandardPlayerController.prototype.attachBoneControllers = function () {
            var displayHandles = this.getProperty("displayHandles");
            var abstractSkinMeshData = this.getProperty("abstractSkinMesh");
            if (abstractSkinMeshData != null)
                this.abstractSkinMesh = this.getChildNode(abstractSkinMeshData.name, BABYLON.SearchType.ExactMatch, false);
            var rootBoneTransformData = this.getProperty("rootBoneTransform");
            if (rootBoneTransformData != null)
                this.rootBoneTransform = this.getChildNode(rootBoneTransformData.name, BABYLON.SearchType.ExactMatch, false);
            // ..
            var leftFootTransformData = this.getProperty("leftFootTransform");
            if (leftFootTransformData != null)
                this.leftFootTransform = this.getChildNode(leftFootTransformData.name, BABYLON.SearchType.ExactMatch, false);
            //const leftFootPositionData:BABYLON.IUnityVector3 = this.getProperty("leftFootPosition");
            //if (leftFootPositionData != null) this.leftFootPosition.copyFrom(BABYLON.Utilities.ParseVector3(leftFootPositionData));
            var leftPoleHandleData = this.getProperty("leftFootPolePos");
            if (leftPoleHandleData != null)
                this.leftFootPolePos.copyFrom(BABYLON.Utilities.ParseVector3(leftPoleHandleData));
            var leftBendAxisData = this.getProperty("leftFootBendAxis");
            if (leftBendAxisData != null)
                this.leftFootBendAxis.copyFrom(BABYLON.Utilities.ParseVector3(leftBendAxisData));
            this.leftFootPoleAngle = this.getProperty("leftFootPoleAngle", this.leftFootPoleAngle);
            this.leftFootMaxAngle = this.getProperty("leftFootMaxAngle", this.leftFootMaxAngle);
            // ..
            var rightFootTransformData = this.getProperty("rightFootTransform");
            if (rightFootTransformData != null)
                this.rightFootTransform = this.getChildNode(rightFootTransformData.name, BABYLON.SearchType.ExactMatch, false);
            //const rightFootPositionData:BABYLON.IUnityVector3 = this.getProperty("rightFootPosition");
            //if (rightFootPositionData != null) this.rightFootPosition.copyFrom(BABYLON.Utilities.ParseVector3(rightFootPositionData));
            var rightPoleHandleData = this.getProperty("rightFootPolePos");
            if (rightPoleHandleData != null)
                this.rightFootPolePos.copyFrom(BABYLON.Utilities.ParseVector3(rightPoleHandleData));
            var rightBendAxisData = this.getProperty("rightFootBendAxis");
            if (rightBendAxisData != null)
                this.rightFootBendAxis.copyFrom(BABYLON.Utilities.ParseVector3(rightBendAxisData));
            this.rightFootPoleAngle = this.getProperty("rightFootPoleAngle", this.rightFootPoleAngle);
            this.rightFootMaxAngle = this.getProperty("rightFootMaxAngle", this.rightFootMaxAngle);
            // ..
            if (this.abstractSkinMesh != null) {
                var materialName = "M_TARGET_MESH";
                var targetMaterial = this.scene.getMaterialByName(materialName);
                if (targetMaterial == null) {
                    targetMaterial = new BABYLON.StandardMaterial("M_TARGET_MESH", this.scene);
                    targetMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.25);
                }
                // ..
                // Setup Left Foot Controller
                // ..
                if (this.leftFootTransform != null && this.leftFootTransform._linkedBone != null) {
                    this._ikLeftFootTarget = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".LeftFootTarget", { width: 0.1, height: 0.1, depth: 0.1 }, this.scene);
                    this._ikLeftFootTarget.parent = this.abstractSkinMesh;
                    //this._ikLeftFootTarget.position.copyFrom(this.leftFootPosition);
                    if (this._ikLeftFootTarget instanceof BABYLON.AbstractMesh) {
                        this._ikLeftFootTarget.material = targetMaterial;
                        this._ikLeftFootTarget.isVisible = displayHandles;
                    }
                    // ..
                    this._ikLeftPoleTarget = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".LeftFootPole", { diameter: 0.15 }, this.scene);
                    this._ikLeftPoleTarget.parent = this.abstractSkinMesh;
                    this._ikLeftPoleTarget.position.copyFrom(this.leftFootPolePos);
                    if (this._ikLeftPoleTarget instanceof BABYLON.AbstractMesh) {
                        this._ikLeftPoleTarget.isVisible = displayHandles;
                    }
                    // ..
                    // this._ikLeftController = new BABYLON.BoneIKController(this.abstractSkinMesh, (<any>this.leftFootTransform)._linkedBone, {targetMesh:this._ikLeftFootTarget, poleTargetMesh:this._ikLeftPoleTarget, poleAngle:BABYLON.Tools.ToRadians(this.leftFootPoleAngle), bendAxis:this.leftFootBendAxis});
                    // this._ikLeftController.maxAngle = BABYLON.Tools.ToRadians(this.leftFootMaxAngle);
                }
                // ..
                // Setup Right Foot Controller
                // ..
                if (this.rightFootTransform != null && this.rightFootTransform._linkedBone != null) {
                    this._ikRightFootTarget = BABYLON.MeshBuilder.CreateBox(this.transform.name + ".RightFootTarget", { width: 0.1, height: 0.1, depth: 0.1 }, this.scene);
                    this._ikRightFootTarget.parent = this.abstractSkinMesh;
                    //this._ikRightFootTarget.position.copyFrom(this.rightFootPosition);
                    if (this._ikRightFootTarget instanceof BABYLON.AbstractMesh) {
                        this._ikRightFootTarget.material = targetMaterial;
                        this._ikRightFootTarget.isVisible = displayHandles;
                    }
                    // ..
                    this._ikRightPoleTarget = BABYLON.MeshBuilder.CreateSphere(this.transform.name + ".RightFootPole", { diameter: 0.15 }, this.scene);
                    this._ikRightPoleTarget.parent = this.abstractSkinMesh;
                    this._ikRightPoleTarget.position.copyFrom(this.rightFootPolePos);
                    if (this._ikRightPoleTarget instanceof BABYLON.AbstractMesh) {
                        this._ikRightPoleTarget.isVisible = displayHandles;
                    }
                    // ..
                    // this._ikRightController = new BABYLON.BoneIKController(this.abstractSkinMesh, (<any>this.rightFootTransform)._linkedBone, {targetMesh:this._ikRightFootTarget, poleTargetMesh:this._ikRightPoleTarget, poleAngle:BABYLON.Tools.ToRadians(this.rightFootPoleAngle), bendAxis:this.rightFootBendAxis});
                    // this._ikRightController.maxAngle = BABYLON.Tools.ToRadians(this.rightFootMaxAngle);
                }
            }
        };
        StandardPlayerController.prototype.attachAnimationController = function () {
            var _this = this;
            if (this.animationState == null) {
                this.animationState = this.getComponent("BABYLON.AnimationState");
                if (this.animationState == null) {
                    var animationNode = this.getChildWithScript("BABYLON.AnimationState");
                    if (animationNode != null) {
                        this.animationState = BABYLON.SceneManager.FindScriptComponent(animationNode, "BABYLON.AnimationState");
                    }
                    else {
                        // DEBUG: BABYLON.SceneManager.LogWarning("Failed to locate animator node for: " + this.transform);
                    }
                }
            }
            if (this.animationState != null) {
                this.animationState.onAnimationUpdateObservable.add(function () {
                    if (_this.animationState.ikFrameEnabled() === true) {
                        // FIXME: Update target mesh position When Grounded - Use Raycast - ???
                        if (_this._ikLeftController != null) {
                            _this._ikLeftController.update();
                        }
                        if (_this._ikRightController != null) {
                            _this._ikRightController.update();
                        }
                    }
                });
            }
        };
        /** TODO */
        StandardPlayerController.prototype.enableCharacterController = function (state) {
            if (state === true) {
                this.moveWithCollision = true;
                if (this.characterController != null) {
                    this.characterController.setGhostWorldPosition(this.transform.position);
                    this.characterController.updatePosition = true;
                }
            }
            else {
                this.moveWithCollision = false;
                if (this.characterController != null) {
                    this.characterController.updatePosition = false;
                }
            }
        };
        /** TODO */
        StandardPlayerController.prototype.resetPlayerRotation = function () {
            this.transform.rotationQuaternion.toEulerAnglesToRef(this.rotationEulers);
            this.playerRotationVector.x = this.rotationEulers.x;
            this.playerRotationVector.y = this.rotationEulers.y;
        };
        /** TODO */
        StandardPlayerController.prototype.castClimbingVolumeRay = function () {
            if (this.characterController != null) {
                this.castPhysicsClimbingVolumeRay();
            }
            else {
                this.castCheckCollisionClimbingVolumeRay();
            }
        };
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Controller Worker Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        StandardPlayerController.prototype.awakePlayerController = function () {
            var _this = this;
            this.gravitationalForce = this.getProperty("gravitationalForce", this.gravitationalForce);
            this.terminalVelocity = this.getProperty("terminalVelocity", this.terminalVelocity);
            this.rotateCamera = this.getProperty("rotateCamera", this.rotateCamera);
            this.normalAngle = this.getProperty("normalAngle", this.normalAngle);
            this.radiusScale = this.getProperty("radiusScale", this.radiusScale);
            this.rayLength = this.getProperty("rayLength", this.rayLength);
            this.rayOrigin = this.getProperty("rayOrigin", this.rayOrigin);
            this.maxAngle = this.getProperty("maxAngle", this.maxAngle);
            this.landingEpsilon = this.getProperty("landingEpsilon", this.landingEpsilon);
            this.minFallVelocity = this.getProperty("minFallVelocity", this.minFallVelocity);
            this.airbornTimeout = this.getProperty("airbornTimeout", this.airbornTimeout);
            this.moveSpeed = this.getProperty("moveSpeed", this.moveSpeed);
            this.lookSpeed = this.getProperty("lookSpeed", this.lookSpeed);
            this.jumpSpeed = this.getProperty("jumpSpeed", this.jumpSpeed);
            this.jumpDelay = this.getProperty("jumpDelay", this.jumpDelay);
            this.eyesHeight = this.getProperty("eyesHeight", this.eyesHeight);
            this.pivotHeight = this.getProperty("pivotHeight", this.pivotHeight);
            this.topLookLimit = this.getProperty("topLookLimit", this.topLookLimit);
            this.downLookLimit = this.getProperty("downLookLimit", this.downLookLimit);
            this.lowTurnSpeed = this.getProperty("lowTurnSpeed", this.lowTurnSpeed);
            this.highTurnSpeed = this.getProperty("highTurnSpeed", this.highTurnSpeed);
            // DEPRECIATED: this.smoothingSpeed = this.getProperty("smoothingSpeed", this.smoothingSpeed);
            this.enableInput = this.getProperty("enableInput", this.enableInput);
            this.playerNumber = this.getProperty("playerNumber", this.playerNumber);
            this.attachCamera = this.getProperty("attachCamera", this.attachCamera);
            this.freeLooking = this.getProperty("freeLooking", this.freeLooking);
            this.toggleView = this.getProperty("toggleView", this.toggleView);
            this.avatarSkinTag = this.getProperty("avatarSkinTag", this.avatarSkinTag);
            this.cameraCollisions = this.getProperty("cameraCollisions", this.cameraCollisions);
            this.cameraSmoothing = this.getProperty("cameraSmoothing", this.cameraSmoothing);
            this.distanceFactor = this.getProperty("distanceFactor", this.distanceFactor);
            this.minimumDistance = this.getProperty("minimumDistance", this.minimumDistance);
            this.smoothAcceleration = this.getProperty("smoothAcceleration", this.smoothAcceleration);
            this.accelerationSpeed = this.getProperty("accelerationSpeed", this.accelerationSpeed);
            this.decelerationSpeed = this.getProperty("decelerationSpeed", this.decelerationSpeed);
            this.climbVolumeTag = this.getProperty("climbVolumeTag", this.climbVolumeTag);
            this.ignoreTriggerTags = this.getProperty("ignoreTriggerTags", this.ignoreTriggerTags);
            this.requireSprintButton = this.getProperty("requireSprintButton", this.requireSprintButton);
            this.sprintThresholdSpeed = this.getProperty("sprintThresholdSpeed", this.sprintThresholdSpeed);
            this.updateStateParams = this.getProperty("updateStateParams", this.updateStateParams);
            this.animationStateParams = this.getProperty("animationStateParams", this.animationStateParams);
            // ..
            var arrowKeyRotation = this.getProperty("arrowKeyRotation");
            if (arrowKeyRotation === true)
                BABYLON.UserInputOptions.UseArrowKeyRotation = true;
            // ..
            var boomPositionData = this.getProperty("boomPosition");
            if (boomPositionData != null)
                this.boomPosition = BABYLON.Utilities.ParseVector3(boomPositionData);
            // ..
            var sphereRadius = this.getProperty("sphereRadius", 0.5);
            this.cameraRaycastShape = BABYLON.SceneManager.CreatePhysicsSphereShape(sphereRadius);
            // ..
            this.abstractMesh = this.getAbstractMesh();
            this.showDebugColliders = BABYLON.Utilities.ShowDebugColliders();
            this.colliderVisibility = BABYLON.Utilities.ColliderVisibility();
            this.colliderRenderGroup = BABYLON.Utilities.ColliderRenderGroup();
            // Note: Get Avatar Skins First Thing
            if (this.avatarSkinTag != null && this.avatarSkinTag !== "") {
                this.avatarSkins = this.getChildrenWithTags(this.avatarSkinTag, false);
            }
            var pcontrol = this.getProperty("playerControl", this.playerControl);
            this.setPlayerControl(pcontrol);
            this.resetPlayerRotation();
            // ..
            this.cameraPivot = new BABYLON.Mesh(this.transform.name + ".CameraPivot", this.scene);
            this.cameraPivot.parent = null;
            this.cameraPivot.position = this.transform.position.clone();
            this.cameraPivot.rotationQuaternion = this.transform.rotationQuaternion.clone();
            this.cameraPivot.checkCollisions = false;
            this.cameraPivot.isPickable = false;
            // ..
            if (this.showDebugColliders === true) {
                var testPivot = BABYLON.MeshBuilder.CreateBox("TestPivot", { width: 0.25, height: 0.25, depth: 0.5 }, this.scene);
                testPivot.parent = this.cameraPivot;
                testPivot.position.set(0, 0, 0);
                testPivot.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                testPivot.visibility = 0.5;
                testPivot.renderingGroupId = this.colliderRenderGroup;
                testPivot.checkCollisions = false;
                testPivot.isPickable = false;
            }
            // ..
            var cylinderShape = this.getProperty("cylinderShape");
            var configController = this.getComponent("BABYLON.CharacterController");
            if (configController != null && cylinderShape === true)
                configController.preCreateCylinderShape();
            // ..
            // Setup IK Bone Controllers
            // ..
            this.attachBoneControllers();
            // ..
            BABYLON.InputController.OnKeyboardPress(this.keyboardCamera, function () { _this.togglePlayerControl(); });
            BABYLON.InputController.OnGamepadButtonPress(this.buttonCamera, function () { _this.togglePlayerControl(); });
        };
        StandardPlayerController.prototype.startPlayerController = function () {
            var _this = this;
            // TODO - Support Dynamic PlayerNumber Change - ???
            if (this.attachCamera === true) {
                this.attachPlayerCamera(this.playerNumber);
            }
            this.navigationAgent = this.getComponent("BABYLON.NavigationAgent");
            this.characterController = this.getComponent("BABYLON.CharacterController");
            if (this.characterController != null) {
                this.avatarRadius = this.characterController.getAvatarRadius();
                this.characterController.setGravity(this.gravitationalForce);
                this.characterController.setFallingSpeed(this.terminalVelocity);
                this.characterController.onUpdatePositionObservable.add(function () { _this.updateCameraController(); });
                BABYLON.SceneManager.LogWarning("Starting player controller in physic engine mode for: " + this.transform.name);
            }
            else {
                BABYLON.SceneManager.LogWarning("Starting player controller in check collisions mode for: " + this.transform.name);
            }
            // ..
            // Validate Non Character Controller Setup
            // ..
            var ellipsoidSegs = 16;
            if (this.characterController == null) {
                if (this.abstractMesh != null) {
                    this.abstractMesh.checkCollisions = true;
                    this.abstractMesh.isPickable = true;
                    var capsuleSize = this.abstractMesh.ellipsoid.clone();
                    // ..
                    // Create A Debug Collision Shape
                    // ..
                    if (this.showDebugColliders === true && this.transform._debugCollider == null) {
                        var debugName = this.transform.name + ".Debug";
                        var debugCapsule = BABYLON.MeshBuilder.CreateSphere(debugName, { segments: ellipsoidSegs, diameterX: (capsuleSize.x * 2), diameterY: (capsuleSize.y * 2), diameterZ: (capsuleSize.z * 2) }, this.scene);
                        debugCapsule.position.set(0, 0, 0);
                        debugCapsule.rotationQuaternion = this.transform.rotationQuaternion.clone();
                        debugCapsule.setParent(this.transform);
                        debugCapsule.position.set(0, 0, 0);
                        debugCapsule.visibility = this.colliderVisibility;
                        debugCapsule.renderingGroupId = this.colliderRenderGroup;
                        debugCapsule.material = BABYLON.Utilities.GetColliderMaterial(this.scene);
                        debugCapsule.checkCollisions = false;
                        debugCapsule.isPickable = false;
                        this.transform._debugCollider = debugCapsule;
                    }
                }
            }
            // Set player window state variable
            // SM.SetWindowState("player", this);
        };
        StandardPlayerController.prototype.updatePlayerController = function () {
            this.deltaTime = this.getDeltaSeconds();
            //this.smoothDeltaTime = BABYLON.System.SmoothDeltaFactor * this.deltaTime + (1 - BABYLON.System.SmoothDeltaFactor) * this.smoothDeltaTime;
            // ..
            this.m_actualVelocity = this.transform.absolutePosition.subtract(this.m_lastPosition);
            this.m_linearVelocity.copyFrom(this.m_actualVelocity);
            this.m_scaledVelocity = (this.m_linearVelocity.length() / this.deltaTime);
            this.m_linearVelocity.normalize();
            this.m_linearVelocity.scaleInPlace(this.m_scaledVelocity);
            if (this.playerDrawVelocity > 0) {
                this.m_velocityOffset.copyFrom(this.m_linearVelocity);
                this.m_velocityOffset.scaleInPlace(this.playerDrawVelocity);
            }
            else {
                this.m_velocityOffset.set(0, 0, 0);
            }
            this.m_lastPosition.copyFrom(this.transform.absolutePosition);
            // TODO - FIX THIS SHIT
            if (this.updateStateParams === true && this.animationState == null) {
                this.attachAnimationController();
            }
            // ..
            if (this.minJumpTimer > 0) {
                this.minJumpTimer -= this.deltaTime;
                if (this.minJumpTimer < 0)
                    this.minJumpTimer = 0;
            }
            if (this.isCharacterGrounded === true && this.delayJumpTimer > 0) {
                this.delayJumpTimer -= this.deltaTime;
                if (this.delayJumpTimer < 0)
                    this.delayJumpTimer = 0;
            }
            // ..
            this.jumpAllowed = true;
            if (this.enableInput === false)
                return;
            var userInputX = BABYLON.InputController.GetUserInput(BABYLON.UserInputAxis.Horizontal, this.playerNumber);
            var userInputZ = BABYLON.InputController.GetUserInput(BABYLON.UserInputAxis.Vertical, this.playerNumber);
            var userMouseX = BABYLON.InputController.GetUserInput(BABYLON.UserInputAxis.MouseX, this.playerNumber);
            var userMouseY = BABYLON.InputController.GetUserInput(BABYLON.UserInputAxis.MouseY, this.playerNumber);
            if (this.smoothAcceleration === true) {
                if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonTurning) {
                    // RAW USER INPUT X
                    this.playerInputX = userInputX;
                }
                else {
                    // SMOOTH USER INPUT X
                    if (userInputX > 0) {
                        this.playerInputX += (this.accelerationSpeed * this.deltaTime);
                        if (this.playerInputX > 1)
                            this.playerInputX = 1;
                    }
                    else if (userInputX < 0) {
                        this.playerInputX -= (this.accelerationSpeed * this.deltaTime);
                        if (this.playerInputX < -1)
                            this.playerInputX = -1;
                    }
                    else {
                        if (this.playerInputX < 0) {
                            this.playerInputX += (this.decelerationSpeed * this.deltaTime);
                            if (this.playerInputX > 0)
                                this.playerInputX = 0;
                        }
                        else if (this.playerInputX > 0) {
                            this.playerInputX -= (this.decelerationSpeed * this.deltaTime);
                            if (this.playerInputX < 0)
                                this.playerInputX = 0;
                        }
                    }
                }
                // SMOOTH USER INPUT Z
                if (userInputZ > 0) {
                    this.playerInputZ += (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputZ > 1)
                        this.playerInputZ = 1;
                }
                else if (userInputZ < 0) {
                    this.playerInputZ -= (this.accelerationSpeed * this.deltaTime);
                    if (this.playerInputZ < -1)
                        this.playerInputZ = -1;
                }
                else {
                    if (this.playerInputZ < 0) {
                        this.playerInputZ += (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputZ > 0)
                            this.playerInputZ = 0;
                    }
                    else if (this.playerInputZ > 0) {
                        this.playerInputZ -= (this.decelerationSpeed * this.deltaTime);
                        if (this.playerInputZ < 0)
                            this.playerInputZ = 0;
                    }
                }
            }
            else {
                // RAW USER INPUT XZ
                this.playerInputX = userInputX;
                this.playerInputZ = userInputZ;
            }
            // ..
            this.playerMouseX = userMouseX;
            this.playerMouseY = userMouseY;
            // ..
            if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonTurning) {
                if (this.playerInputX !== 0) {
                    this.playerMouseX = this.playerInputX;
                    this.playerInputX = 0;
                }
            }
            // ..
            // Update Player Input
            // ..
            if (this.onPlayerInputObservable.hasObservers() === true) {
                this.onPlayerInputObservable.notifyObservers(this.transform);
            }
            //..
            // Update Input Magnitude
            // ..
            this.inputMovementVector.set(this.playerInputX, 0, this.playerInputZ);
            if (this.inputMovementVector.length() > 1.0)
                this.inputMovementVector.normalize(); // Note: Normalize In Place
            this.inputMagnitude = this.inputMovementVector.length();
            // ..
            // Update Move Direction
            // ..
            var moveForward = (this.playerInputZ > 0);
            var moveBackward = (this.playerInputZ < 0);
            var moveRight = (this.playerInputX > 0);
            var moveLeft = (this.playerInputX < 0);
            if (moveForward === true) {
                if (moveLeft === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.ForwardLeft;
                }
                else if (moveRight === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.ForwardRight;
                }
                else {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.Forward;
                }
            }
            else if (moveBackward === true) {
                if (moveLeft === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.BackwardLeft;
                }
                else if (moveRight === true) {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.BackwardRight;
                }
                else {
                    this.playerMoveDirection = PROJECT.PlayerMoveDirection.Backward;
                }
            }
            else if (moveLeft === true) {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.StrafingLeft;
            }
            else if (moveRight === true) {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.StrafingRight;
            }
            else {
                this.playerMoveDirection = PROJECT.PlayerMoveDirection.Stationary;
            }
            // ..
            // Update Pre Notifications
            // ..
            if (this.onPreUpdateObservable.hasObservers() === true) {
                this.onPreUpdateObservable.notifyObservers(this.transform);
            }
            // ..
            // Update Forward Camera Vector
            // ..
            this.cameraForwardVector.copyFrom(this.cameraPivot.forward);
            this.cameraForwardVector.y = 0;
            this.cameraForwardVector.normalize();
            this.cameraForwardVector.scaleToRef(this.playerInputZ, this.desiredForwardVector);
            // ..
            // Update Right Camera Vector
            // ..
            this.cameraRightVector.copyFrom(this.cameraPivot.right);
            this.cameraRightVector.y = 0;
            this.cameraRightVector.normalize();
            this.cameraRightVector.scaleToRef(this.playerInputX, this.desiredRightVector);
            // ..
            // Update Player Rotation Vector
            // ..
            this.playerRotationVector.y += (this.playerMouseX * this.lookSpeed * this.deltaTime);
            this.playerRotationVector.x += (-this.playerMouseY * this.lookSpeed * this.deltaTime);
            this.playerRotationVector.x = BABYLON.Scalar.Clamp(this.playerRotationVector.x, -BABYLON.Tools.ToRadians(this.downLookLimit), BABYLON.Tools.ToRadians(this.topLookLimit));
            // ..
            // Smooth Player Rotation Vector (DEPRECIATED)
            // ..
            // let newPlayerRotationVectorY = this.playerRotationVector.y + (this.playerMouseX * this.lookSpeed * this.deltaTime);
            // let newPlayerRotationVectorX = this.playerRotationVector.x + (-this.playerMouseY * this.lookSpeed * this.deltaTime);
            // newPlayerRotationVectorX = BABYLON.Scalar.Clamp(newPlayerRotationVectorX, -BABYLON.Tools.ToRadians(this.downLookLimit), BABYLON.Tools.ToRadians(this.topLookLimit));
            // this.playerRotationVector.x = BABYLON.Utilities.SmoothDampAngle(this.playerRotationVector.x, newPlayerRotationVectorX, this.smoothingSpeed, Number.MAX_VALUE, this.deltaTime, this.rotationVelocityX);
            // this.playerRotationVector.y = BABYLON.Utilities.SmoothDampAngle(this.playerRotationVector.y, newPlayerRotationVectorY, this.smoothingSpeed, Number.MAX_VALUE, this.deltaTime, this.rotationVelocityY);
            // ..
            // Update Player Button Presses
            // ..
            this.isJumpPressed = (BABYLON.InputController.GetKeyboardInput(this.keyboardJump) || BABYLON.InputController.GetGamepadButtonInput(this.buttonJump));
            this.isSprintPressed = (BABYLON.InputController.GetKeyboardInput(this.keyboardSprint) || BABYLON.InputController.GetGamepadButtonInput(this.buttonSprint));
            // ..
            // Update Player Movement Velocity
            // ..
            this.movementSpeed = (this.inputMagnitude * this.moveSpeed * this.speedFactor);
            if (this.requireSprintButton === true) {
                if (this.isSprintPressed === false && this.movementSpeed > this.sprintThresholdSpeed) {
                    // FIXME: LERP MOVE SPEED THRESHOLD SO NOT SO SNAPPY ON BUTTON PRESS
                    this.movementSpeed = this.sprintThresholdSpeed;
                }
            }
            if (this.playerControl === PROJECT.PlayerInputControl.FirstPersonStrafing) {
                // Strafing First Person View - Player Movement Velocity
                this.desiredForwardVector.addToRef(this.desiredRightVector, this.playerMovementVelocity);
                this.playerMovementVelocity.scaleInPlace(this.movementSpeed);
                // No Free Looking - Snap Player Rotation (Euler Angle Rotation)
                BABYLON.Quaternion.FromEulerAnglesToRef(0, this.playerRotationVector.y, 0, this.transform.rotationQuaternion);
            }
            else if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonTurning) {
                // Strafing Third Person View - Player Movement Velocity
                this.desiredForwardVector.addToRef(this.desiredRightVector, this.playerMovementVelocity);
                this.playerMovementVelocity.scaleInPlace(this.movementSpeed);
                // Validate Free Looking Rotation
                if (this.freeLooking === true) {
                    if (this.inputMagnitude > 0) {
                        // FIXME - Note: Large Movement - Slerp Player Rotation (Euler Angle Rotation)
                        var strafingTurnRatio = (this.playerMovementVelocity.length() / this.moveSpeed);
                        var strafingTurnSpeed = BABYLON.Scalar.Lerp(this.highTurnSpeed, this.lowTurnSpeed, strafingTurnRatio);
                        BABYLON.Quaternion.FromEulerAnglesToRef(0, this.playerRotationVector.y, 0, this.playerRotationQuaternion);
                        BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.playerRotationQuaternion, (strafingTurnSpeed * this.deltaTime), this.transform.rotationQuaternion);
                    }
                }
                else {
                    // No Free Looking - Snap Player Rotation (Euler Angle Rotation)
                    BABYLON.Quaternion.FromEulerAnglesToRef(0, this.playerRotationVector.y, 0, this.transform.rotationQuaternion);
                }
            }
            else if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonForward) {
                // Forward Third Person View - Player Look Rotation
                this.desiredForwardVector.addToRef(this.desiredRightVector, this.playerLookRotation);
                this.transform.forward.scaleToRef(this.movementSpeed, this.playerMovementVelocity);
                // Always Free Looking - Lerp Player Rotation (Turn And Burn)
                if (this.inputMagnitude > 0) {
                    var forwardTurnRatio = (this.playerMovementVelocity.length() / this.moveSpeed);
                    var forwardTurnSpeed = BABYLON.Scalar.Lerp(this.highTurnSpeed, this.lowTurnSpeed, forwardTurnRatio);
                    BABYLON.Utilities.LookRotationToRef(this.playerLookRotation, this.playerRotationQuaternion);
                    BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.playerRotationQuaternion, (forwardTurnSpeed * this.deltaTime), this.transform.rotationQuaternion);
                }
            }
            this.verticalVelocity = this.getVerticalVelocity();
            this.movementVelocity.copyFrom(this.playerMovementVelocity);
            // ..
            // Update Character Controller
            // ..
            this.isCharacterGrounded = false; // FIXME: Default Grounded To True - ???
            this.isCharacterSliding = false;
            this.isCharacterFalling = false;
            this.isCharacterJumpFrame = false;
            this.isCharacterJumpSpecial = false;
            this.isCharacterNavigating = (this.navigationAgent != null && this.navigationAgent.isNavigating());
            this.navigationAngularSpeed = (this.navigationAgent != null) ? this.navigationAgent.angularSpeed : 0;
            if (this.characterController != null) {
                this.updateCharacterController();
            }
            else {
                this.updateCheckCollisions();
                this.updateCameraController();
            }
            // ..
            // Update Animation State Params
            // ..
            if (this.animationState != null && this.updateStateParams === true) {
                this.validateAnimationStateParams();
                this.animationState.setInteger(this.animationStateParams.moveDirection, this.playerMoveDirection);
                this.animationState.setFloat(this.animationStateParams.inputMagnitude, this.inputMagnitude);
                this.animationState.setFloat(this.animationStateParams.horizontalInput, this.playerInputX);
                this.animationState.setFloat(this.animationStateParams.verticalInput, this.playerInputZ);
                this.animationState.setFloat(this.animationStateParams.mouseXInput, this.playerMouseX);
                this.animationState.setFloat(this.animationStateParams.mouseYInput, this.playerMouseY);
                this.animationState.setFloat(this.animationStateParams.heightInput, this.verticalVelocity);
                this.animationState.setFloat(this.animationStateParams.speedInput, this.movementSpeed);
                this.animationState.setBool(this.animationStateParams.jumpInput, this.isCharacterJumpFrame);
                this.animationState.setBool(this.animationStateParams.jumpState, this.isCharacterJumping);
                this.animationState.setBool(this.animationStateParams.fallingState, this.isCharacterFalling);
                this.animationState.setBool(this.animationStateParams.slidingState, this.isCharacterSliding);
                this.animationState.setBool(this.animationStateParams.specialState, this.isCharacterJumpSpecial);
                this.animationState.setBool(this.animationStateParams.groundedState, this.isCharacterGrounded);
                if (this.isCharacterNavigating === true) {
                    // TODO - Update Speed Input With Navigation Magnitude
                    // this.animationState.setFloat(this.animationStateParams.speedInput, this.inputMagnitude);
                }
            }
            // ..
            // Update Post Notifications
            // ..
            if (this.onPostUpdateObservable.hasObservers() === true) {
                this.onPostUpdateObservable.notifyObservers(this.transform);
            }
        };
        // FIXME: Extra Raycast Distance When On Various Slope Angles - ???
        StandardPlayerController.prototype.updateCharacterController = function () {
            if (this.characterController != null) {
                this.castPhysicsGroundCheckRay();
                var slopeAngleLength = 0; // TODO: Account For Current Slope Angle - ???
                var minGroundDistanceLength = (PROJECT.StandardPlayerController.MIN_GROUND_DISTANCE + slopeAngleLength);
                this.groundCollision = (this.groundHit === true && this.groundDistance <= minGroundDistanceLength && (this.normalAngle <= 0 || this.groundNormal.y >= this.normalAngle));
                if (this.groundCollision === true && this.minJumpTimer <= 0) {
                    if (this.verticalVelocity === 0 || (this.groundAngle > 0 && this.verticalVelocity > 0)) {
                        this.isCharacterSliding = false; // NOT SLIDING
                        this.isCharacterGrounded = true; // IS GROUNDED
                    }
                    else if (this.groundAngle > 0 && this.verticalVelocity < 0) {
                        this.isCharacterSliding = true; // IS SLIDING
                        this.isCharacterGrounded = false; // NOT GROUNDED
                    }
                }
                // ..
                if (this.isCharacterGrounded === true)
                    this.isCharacterJumping = false;
                this.isCharacterFalling = (this.isCharacterGrounded === false && this.isCharacterSliding == false && this.isCharacterJumping == false && this.verticalVelocity < 0 && Math.abs(this.verticalVelocity) >= this.minFallVelocity);
                if (this.isCharacterFalling === true && this.isCharacterFallTriggered === false) {
                    this.isCharacterFallTriggered = true;
                    if (this.jumpDelay > 0)
                        this.delayJumpTimer = this.jumpDelay; // DUNNO: MAYBE USE SEPERATE FALLING DELAY TIMER - ???
                }
                if (this.isCharacterGrounded === true)
                    this.isCharacterFallTriggered = false;
                // ..
                // Process Character Movement
                // ..
                if (this.moveWithCollision === false)
                    return;
                if (this.isCharacterNavigating === false) {
                    if (this.isCharacterGrounded === true) {
                        if (this.delayJumpTimer <= 0)
                            this.isCharacterJumpFrame = (this.jumpAllowed === true && this.isJumpPressed === true);
                        if (this.isCharacterJumpFrame === true && this.canSpecialJump != null && this.canSpecialJump() === true) {
                            this.isCharacterJumpFrame = false;
                            this.isCharacterJumpSpecial = true;
                            this.isCharacterJumping = false;
                        }
                        if (this.isCharacterJumpFrame === true && this.jumpSpeed > 0) {
                            this.isCharacterJumping = true;
                            this.characterController.jump(this.jumpSpeed);
                            if (this.jumpDelay > 0)
                                this.delayJumpTimer = this.jumpDelay;
                            if (this.airbornTimeout > 0)
                                this.minJumpTimer = (this.airbornTimeout + this.deltaTime);
                            this.lastJumpVelocity.set(this.movementVelocity.x, 0, this.movementVelocity.z);
                        }
                        // ..
                        // Update Move Notifications
                        // ..
                        if (this.onBeforeMoveObservable.hasObservers() === true) {
                            this.onBeforeMoveObservable.notifyObservers(this.transform);
                        }
                        this.movementVelocity.scaleInPlace(this.deltaTime);
                        this.characterController.move(this.movementVelocity);
                    }
                }
                else {
                    this.characterController.setGhostWorldPosition(this.transform.position);
                }
            }
        };
        // FIXME: NON PHYSICS BASED CHARACTER CONTROL IS STILL A WORK-IN-PROGRESS
        // FIXME: GROUND DETECTION, VERTICAL VELOCITY AND SLOPE SLIDING NEEDS WORK
        StandardPlayerController.prototype.updateCheckCollisions = function () {
            if (this.abstractMesh != null) {
                var pick = this.pickCheckCollisionsRaycast();
                // TODO: Clean This Shit Up Here
                this.groundHit = (pick != null && pick.hit);
                this.groundNode = (pick != null && pick.hit) ? pick.pickedMesh : null;
                if (pick != null && pick.hit && pick.pickedPoint != null) {
                    this.groundPoint.copyFrom(pick.pickedPoint);
                }
                else {
                    this.groundPoint.set(0, 0, 0);
                }
                if (pick != null) {
                    var pickNormal = pick.getNormal(true);
                    if (pickNormal != null) {
                        this.groundNormal.copyFrom(pickNormal);
                    }
                    else {
                        this.groundNormal.set(0, 0, 0);
                    }
                }
                else {
                    this.groundNormal.set(0, 0, 0);
                }
                this.groundAngle = (this.groundHit === true) ? Math.abs(BABYLON.Utilities.GetAngle(this.groundNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                if (this.groundAngle >= 88)
                    this.groundAngle = 0; // Note: Zero Max 88 Degree Ground Angle
                this.groundDistance = (pick != null && pick.hit) ? (pick.distance - this.rayOrigin) : -1; // Note: Distance From Bottom Of Feet
                var minGroundDistanceLength = 0.1; // TODO: Account For Current Slope Angle - ???
                this.groundCollision = (this.groundHit === true && this.groundDistance <= minGroundDistanceLength);
                //this.groundCollision = (pick != null && pick.hit && pick.pickedPoint != null && this.collisionMeshVolume != null && this.collisionMeshVolume.intersectsPoint(pick.pickedPoint));
                if (this.groundCollision === true && this.minJumpTimer <= 0) {
                    if (this.verticalVelocity === 0 || (this.groundAngle > 0 && this.verticalVelocity > 0)) {
                        this.isCharacterSliding = false; // NOT SLIDING
                        this.isCharacterGrounded = true; // IS GROUNDED
                    }
                    else if (this.groundAngle > 0 && this.verticalVelocity < 0) {
                        this.isCharacterSliding = true; // IS SLIDING
                        this.isCharacterGrounded = false; // NOT GROUNDED
                    }
                }
                var maxSlopeLimit = this.maxAngle;
                if (this.isCharacterGrounded === true)
                    this.isCharacterJumping = false;
                this.isCharacterFalling = (this.isCharacterGrounded === false && this.isCharacterSliding == false && this.isCharacterJumping == false && this.verticalVelocity < 0 && Math.abs(this.verticalVelocity) >= this.minFallVelocity);
                if (this.isCharacterFalling === true && this.isCharacterFallTriggered === false) {
                    this.isCharacterFallTriggered = true;
                    if (this.jumpDelay > 0)
                        this.delayJumpTimer = this.jumpDelay; // DUNNO: MAYBE USE SEPERATE FALLING DELAY TIMER - ???
                }
                if (this.isCharacterGrounded === true)
                    this.isCharacterFallTriggered = false;
                // ..
                // Apply Player Gravity
                // ..
                if (this.gravitationalForce > 0) {
                    this.groundVelocity -= (this.gravitationalForce * this.deltaTime);
                    if (this.groundVelocity > 0 && this.jumpSpeed > 0 && this.groundVelocity > this.jumpSpeed) {
                        this.groundVelocity = this.jumpSpeed;
                    }
                    else if (this.groundVelocity < 0 && Math.abs(this.groundVelocity) > Math.abs(this.terminalVelocity)) {
                        this.groundVelocity = -Math.abs(this.terminalVelocity);
                    }
                    if (this.isCharacterGrounded === true && this.groundVelocity < -1) {
                        this.groundVelocity = -1;
                    }
                }
                // FIXME: SLOPE SLIDING
                // DEPRECIATED: const maxSlopeLimit:number = (this.characterController.getSlopeLimit() * BABYLON.System.Rad2Deg);
                // DEPRECIATED: this.characterController.setUseSlopeSlidePatch(this.isCharacterGrounded === true && maxSlopeLimit > PROJECT.StandardPlayerController.MIN_SLOPE_LIMIT && this.groundAngle > PROJECT.StandardPlayerController.MIN_SLOPE_LIMIT && this.groundAngle <= maxSlopeLimit);
                // if (this.isCharacterSliding === true) {
                //    const slopeForce:number = 0;
                //    const slopeFactor:number = (this.maxAngle > PROJECT.StandardPlayerController.MIN_SLOPE_LIMIT && this.groundAngle > PROJECT.StandardPlayerController.MIN_SLOPE_LIMIT && this.groundAngle < this.maxAngle) ? 0 : slopeForce;
                //    this.groundVelocity = Math.max(-slopeFactor, this.groundVelocity); // Note: Allowed Slope Angle Support
                //    //console.log("Fixed Ground Velocity: " + this.groundVelocity);
                // }
                // ..
                // Process Character Movement
                // ..
                if (this.moveWithCollision === false)
                    return;
                if (this.isCharacterNavigating === false) {
                    if (this.isCharacterGrounded === true) {
                        if (this.delayJumpTimer <= 0)
                            this.isCharacterJumpFrame = (this.jumpAllowed === true && this.isJumpPressed === true);
                        if (this.isCharacterJumpFrame === true && this.canSpecialJump != null && this.canSpecialJump() === true) {
                            this.isCharacterJumpFrame = false;
                            this.isCharacterJumpSpecial = true;
                            this.isCharacterJumping = false;
                        }
                        if (this.isCharacterJumpFrame === true && this.jumpSpeed > 0) {
                            this.isCharacterJumping = true;
                            this.groundVelocity = this.jumpSpeed;
                            if (this.jumpDelay > 0)
                                this.delayJumpTimer = this.jumpDelay;
                            if (this.airbornTimeout > 0)
                                this.minJumpTimer = (this.airbornTimeout + this.deltaTime);
                            this.lastJumpVelocity.set(this.movementVelocity.x, 0, this.movementVelocity.z);
                        }
                    }
                    else {
                        if (this.isCharacterJumping === true) {
                            this.movementVelocity.copyFrom(this.lastJumpVelocity);
                        }
                        // Note: Add External Airborn Velocity (Like Falling)
                        this.movementVelocity.addInPlace(this.airbornVelocity);
                    }
                    this.movementVelocity.y = this.groundVelocity;
                    // ..
                    // Update Move Notifications
                    // ..
                    if (this.onBeforeMoveObservable.hasObservers() === true) {
                        this.onBeforeMoveObservable.notifyObservers(this.transform);
                    }
                    this.movementVelocity.scaleInPlace(this.deltaTime);
                    this.abstractMesh.moveWithCollisions(this.movementVelocity);
                }
            }
        };
        StandardPlayerController.prototype.updateCameraController = function () {
            if (this.enableInput === false)
                return;
            var allowRotation = this.rotateCamera;
            // DUNNO FUR SURE:  if (this.isCharacterNavigating === true && this.navigationAngularSpeed > 0) allowRotation = false;
            if (this.cameraPivot != null) {
                // .. 
                // Update Camera Pivot Offset
                // ..
                if (this.targetCameraOffset.x !== 0 || this.targetCameraOffset.y !== 0 || this.targetCameraOffset.z !== 0) {
                    this.cameraPivotOffset.copyFrom(this.targetCameraOffset);
                }
                else {
                    if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonTurning || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonForward) {
                        this.cameraPivotOffset.set(0, this.pivotHeight, 0);
                    }
                    else {
                        this.cameraPivotOffset.set(0, this.eyesHeight, 0);
                    }
                }
                // ..
                // Update Camera Pivot Position
                // ..
                BABYLON.Utilities.GetAbsolutePositionToRef(this.transform, this.cameraPivot.position, this.cameraPivotOffset);
                // ..
                // Update Camera Pivot Rotation
                // ..
                if (allowRotation === true) {
                    BABYLON.Quaternion.FromEulerAnglesToRef(this.playerRotationVector.x, this.playerRotationVector.y, 0, this.cameraPivot.rotationQuaternion);
                }
            }
            if (allowRotation === true && this.cameraNode != null) {
                if (this.cameraSmoothing <= 0)
                    this.cameraSmoothing = 5.0; // Default Camera Smoothing
                if (this.playerControl === PROJECT.PlayerInputControl.ThirdPersonStrafing || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonTurning || this.playerControl === PROJECT.PlayerInputControl.ThirdPersonForward) {
                    if (this.cameraCollisions === true) {
                        // ..
                        // Check Camera Collision
                        // ..
                        var maxDistance = Math.abs(this.boomPosition.z);
                        var parentNode = this.cameraNode.parent;
                        this.dollyDirection.scaleToRef(maxDistance, this.scaledMaxDirection);
                        this.dollyDirection.scaleToRef(this.cameraDistance, this.scaledCamDirection);
                        BABYLON.Utilities.GetAbsolutePositionToRef(parentNode, this.parentNodePosition);
                        BABYLON.Utilities.TransformPointToRef(parentNode, this.scaledMaxDirection, this.maximumCameraPos);
                        // ..
                        var contact = false;
                        var distance = 0;
                        if (this.characterController != null) {
                            // Note: Use Bullet Physics Shape Cast
                            var raycast = BABYLON.SceneManager.PhysicsShapecastToPoint(this.scene, this.cameraRaycastShape, this.parentNodePosition, this.maximumCameraPos, this.defaultRaycastGroup, this.cameraRaycastMask);
                            contact = (raycast != null && raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null);
                            distance = (raycast != null && raycast.hasHit === true) ? raycast.hitDistance : 0;
                            if (contact === true) {
                                var contactTag = SM.GetTransformTag(raycast.collisionObject.entity);
                                if (this.ignoreTriggerTags != null && this.ignoreTriggerTags !== "" && this.ignoreTriggerTags.indexOf(contactTag) >= 0) {
                                    contact = false;
                                    distance = 0;
                                }
                            }
                        }
                        else {
                            // Note: Use Native Scene Pick With Ray (TODO: Need Better Camera Collision)
                            this.cameraForward.set(0, 0, -1);
                            BABYLON.Utilities.TransformPointToRef(parentNode, this.cameraForward, this.cameraForward);
                            this.cameraForward.subtractToRef(this.parentNodePosition, this.cameraDirection);
                            this.cameraDirection.normalize();
                            // ..
                            var pick = this.pickCameraCollisionsRaycast(this.parentNodePosition, this.cameraDirection, this.maximumCameraPos.length());
                            contact = (pick != null && pick.hit && pick.pickedMesh != null);
                            distance = (pick != null && pick.distance);
                            if (contact === true) {
                                var contactTag = SM.GetTransformTag(pick.pickedMesh);
                                if (this.ignoreTriggerTags != null && this.ignoreTriggerTags !== "" && this.ignoreTriggerTags.indexOf(contactTag) >= 0) {
                                    contact = false;
                                    distance = 0;
                                }
                            }
                        }
                        if (contact === true) {
                            this.cameraDistance = BABYLON.Scalar.Clamp((distance * this.distanceFactor), this.minimumDistance, maxDistance);
                            // Lerp Past Camera Collisions
                            if (this.cameraNode.position.x !== this.scaledCamDirection.x || this.cameraNode.position.y !== this.scaledCamDirection.y || this.cameraNode.position.z !== this.scaledCamDirection.z) {
                                BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.scaledCamDirection, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                            }
                        }
                        else {
                            // Lerp To Camera Boom Position
                            if (this.cameraNode.position.x !== this.boomPosition.x || this.cameraNode.position.y !== this.boomPosition.y || this.cameraNode.position.z !== this.boomPosition.z) {
                                BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.boomPosition, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                            }
                        }
                    }
                    else {
                        // Lerp To Camera Boom Position
                        if (this.cameraNode.position.x !== this.boomPosition.x || this.cameraNode.position.y !== this.boomPosition.y || this.cameraNode.position.z !== this.boomPosition.z) {
                            BABYLON.Vector3.LerpToRef(this.cameraNode.position, this.boomPosition, (this.deltaTime * this.cameraSmoothing), this.cameraNode.position);
                        }
                    }
                }
                else {
                    // Note: Snap To Zero Camera Pivot Position - First Person View
                    if (this.cameraNode.position.x !== 0 || this.cameraNode.position.y !== 0 || this.cameraNode.position.z !== 0) {
                        this.cameraNode.position.set(0, 0, 0);
                    }
                }
            }
        };
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  Ammo Physics Raycasting
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        StandardPlayerController.prototype.castPhysicsGroundCheckRay = function () {
            this.groundHit = false;
            this.groundNode = null;
            this.groundPoint.set(0, 0, 0);
            this.groundNormal.set(0, 0, 0);
            this.groundAngle = 0;
            this.groundDistance = 0;
            if (this.rayLength <= 0)
                this.rayLength = 0.1;
            var raycastLength = (this.rayLength / this.transform.scaling.y) + 0.1;
            // ..
            // Grounding Raycast Positions
            // ..
            var playerTransformDownDirection = UTIL.TransformDirection(this.transform, this.downDirection);
            this.offsetGroundRaycastPosition.set(0, this.rayOrigin, 0);
            BABYLON.Utilities.GetAbsolutePositionToRef(this.transform, this.startGroundRaycastPosition, this.offsetGroundRaycastPosition);
            BABYLON.Utilities.GetAbsolutePositionToRef(this.transform, this.endGroundRaycastPosition, this.downDirection.scale(raycastLength));
            this.endGroundRaycastPosition.y += this.rayOrigin;
            // ..
            // Cast Collision Shape Ray
            // ..
            if (this.radiusScale <= 0)
                this.radiusScale = 1.0;
            if (this.sphereCollisionShape == null)
                this.sphereCollisionShape = BABYLON.SceneManager.CreatePhysicsSphereShape(this.avatarRadius * this.radiusScale);
            var raycast = BABYLON.SceneManager.PhysicsShapecast(this.scene, this.sphereCollisionShape, this.startGroundRaycastPosition, playerTransformDownDirection, raycastLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            // DEPRECIATED: const raycast:BABYLON.RaycastHitResult = BABYLON.SceneManager.PhysicsRaycast(this.scene, this.startGroundRaycastPosition, playerTransformDownDirection, raycastLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                this.groundHit = true;
                this.groundNode = raycast.collisionObject.entity;
                if (raycast.hitPoint != null)
                    this.groundPoint.copyFrom(raycast.hitPoint);
                if (raycast.hitNormal != null)
                    this.groundNormal.copyFrom(raycast.hitNormal);
                this.groundAngle = (this.groundHit === true) ? Math.abs(BABYLON.Utilities.GetAngle(this.groundNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                if (this.groundAngle >= 88)
                    this.groundAngle = 0; // Note: Zero Max 88 Degree Ground Angle
                this.groundDistance = (raycast.hitDistance - this.rayOrigin);
            }
            // Ground Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.groundSensorLine == null)
                    this.groundSensorLine = new BABYLON.LinesMeshRenderer(this.transform.name + ".GroundSensorLine", this.scene);
                if (this.groundHit === true) {
                    this.groundSensorLine.drawLine([this.startGroundRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                }
                else {
                    this.groundSensorLine.drawLine([this.startGroundRaycastPosition, this.endGroundRaycastPosition], BABYLON.Color3.Green());
                }
            }
        };
        StandardPlayerController.prototype.castPhysicsClimbingVolumeRay = function () {
            var raycast = null;
            this.climbContact = false;
            this.climbContactNode = null;
            this.climbContactPoint.set(0, 0, 0);
            this.climbContactNormal.set(0, 0, 0);
            this.climbContactAngle = 0;
            this.climbContactDistance = 0;
            // ..
            // Climbing Raycast Positions
            // ..
            var playerTransformForwardDirection = UTIL.TransformDirection(this.transform, this.forwardDirection);
            this.offsetClimbRaycastPosition.set(0, this.rayClimbOffset, 0);
            BABYLON.Utilities.GetAbsolutePositionToRef(this.transform, this.startClimbRaycastPosition, this.offsetClimbRaycastPosition);
            BABYLON.Utilities.GetAbsolutePositionToRef(this.transform, this.endClimbRaycastPosition, this.forwardDirection.scale(this.rayClimbLength));
            this.endClimbRaycastPosition.y += this.rayClimbOffset;
            // ..
            raycast = BABYLON.SceneManager.PhysicsRaycast(this.scene, this.startClimbRaycastPosition, playerTransformForwardDirection, this.rayClimbLength, this.defaultRaycastGroup, this.defaultRaycastMask);
            if (raycast.hasHit === true && raycast.collisionObject != null && raycast.collisionObject.entity != null) {
                var checkTag = BABYLON.SceneManager.GetTransformTag(raycast.collisionObject.entity);
                if (checkTag === this.climbVolumeTag) {
                    this.climbContact = true;
                    this.climbContactNode = raycast.collisionObject.entity;
                    if (raycast.hitPoint != null)
                        this.climbContactPoint.copyFrom(raycast.hitPoint);
                    if (raycast.hitNormal != null)
                        this.climbContactNormal.copyFrom(raycast.hitNormal);
                    this.climbContactAngle = (this.climbContactNormal != null) ? Math.abs(BABYLON.Utilities.GetAngle(this.climbContactNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                    this.climbContactDistance = raycast.hitDistance;
                }
            }
            // Climbing Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.climbSensorLine == null)
                    this.climbSensorLine = new BABYLON.LinesMeshRenderer(this.transform.name + ".ClimbingSensorLine", this.scene);
                if (this.climbContact === true) {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, raycast.hitPoint], BABYLON.Color3.Red());
                }
                else {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, this.endClimbRaycastPosition], BABYLON.Color3.Green());
                }
            }
        };
        StandardPlayerController.prototype.pickCheckCollisionsRaycast = function (closetCheck) {
            var _this = this;
            if (closetCheck === void 0) { closetCheck = true; }
            if (this.abstractMesh == null)
                return null;
            if (this.rayLength <= 0)
                this.rayLength = 0.1;
            var raycastLength = (this.rayLength / this.transform.scaling.y) + 0.1;
            if (this.pickingOrigin == null)
                this.pickingOrigin = new BABYLON.Vector3(0, this.rayOrigin, 0);
            if (this.pickingRay == null) {
                this.pickingRay = new BABYLON.Ray(this.pickingOrigin, this.pickingDirection, raycastLength);
            }
            // Note: Ray Helper Seems To Be Required
            if (this.pickingHelper == null) {
                this.pickingHelper = new BABYLON.RayHelper(this.pickingRay);
                this.pickingHelper.attachToMesh(this.abstractMesh, this.pickingDirection, this.pickingOrigin, raycastLength);
                if (this.showDebugColliders === true)
                    this.pickingHelper.show(this.scene, new BABYLON.Color3(1, 0, 0));
            }
            return (this.pickingRay != null) ? this.scene.pickWithRay(this.pickingRay, function (mesh) { return (mesh != _this.abstractMesh && mesh.checkCollisions === true); }, !closetCheck) : null;
        };
        StandardPlayerController.prototype.pickClimbingVolumeRaycast = function (closetCheck) {
            var _this = this;
            if (closetCheck === void 0) { closetCheck = true; }
            if (this.abstractMesh == null)
                return null;
            if (this.climbingOrigin == null)
                this.climbingOrigin = new BABYLON.Vector3(0, this.rayOrigin, 0);
            if (this.climbingRay == null) {
                this.climbingRay = new BABYLON.Ray(this.climbingOrigin, this.climbingDirection, this.rayClimbLength);
            }
            // Note: Ray Helper Seems To Be Required
            if (this.climbingHelper == null) {
                this.climbingHelper = new BABYLON.RayHelper(this.climbingRay);
                this.climbingHelper.attachToMesh(this.abstractMesh, this.climbingDirection, this.climbingOrigin, this.rayClimbLength);
                //if (this.showDebugColliders === true) this.climbingHelper.show(this.scene, new BABYLON.Color3(0, 1, 0));
            }
            return (this.climbingRay != null) ? this.scene.pickWithRay(this.climbingRay, function (mesh) { return (mesh != _this.abstractMesh && mesh.checkCollisions === true); }, !closetCheck) : null;
        };
        StandardPlayerController.prototype.pickCameraCollisionsRaycast = function (origin, direction, rayLength, closetCheck) {
            var _this = this;
            if (closetCheck === void 0) { closetCheck = true; }
            if (this.abstractMesh == null)
                return null;
            if (this.cameraRay == null)
                this.cameraRay = new BABYLON.Ray(origin, direction, rayLength);
            if (this.cameraRay != null) {
                this.cameraRay.origin.copyFrom(origin);
                this.cameraRay.direction.copyFrom(direction);
                this.cameraRay.length = rayLength;
            }
            // Note: Ray Helper Seems To Be Required
            if (this.cameraHelper == null) {
                this.cameraHelper = new BABYLON.RayHelper(this.cameraRay);
                this.cameraHelper.attachToMesh(this.abstractMesh, this.cameraDirection, origin, rayLength);
                //if (this.showDebugColliders === true) this.cameraHelper.show(this.scene, new BABYLON.Color3(0, 0, 1));
            }
            return (this.cameraRay != null) ? this.scene.pickWithRay(this.cameraRay, function (mesh) { return (mesh != _this.abstractMesh && mesh.checkCollisions === true); }, !closetCheck) : null;
        };
        StandardPlayerController.prototype.castCheckCollisionClimbingVolumeRay = function () {
            this.climbContact = false;
            this.climbContactNode = null;
            this.climbContactPoint.set(0, 0, 0);
            this.climbContactNormal.set(0, 0, 0);
            this.climbContactAngle = 0;
            this.climbContactDistance = 0;
            // ..
            // Check Climbing Collision
            // ..
            var pick = this.pickClimbingVolumeRaycast();
            var checkTag = (pick != null && pick.hit && pick.pickedMesh != null) ? BABYLON.SceneManager.GetTransformTag(pick.pickedMesh) : null;
            if (checkTag === this.climbVolumeTag) {
                this.climbContact = true;
                this.climbContactNode = (pick != null && pick.hit) ? pick.pickedMesh : null;
                if (pick != null && pick.hit && pick.pickedPoint != null) {
                    this.climbContactPoint.copyFrom(pick.pickedPoint);
                }
                var pickNormal = pick.getNormal(true);
                if (pick != null && pick.hit && pickNormal != null) {
                    this.climbContactNormal.copyFrom(pickNormal);
                }
                this.climbContactAngle = (this.climbContactNormal != null) ? Math.abs(BABYLON.Utilities.GetAngle(this.climbContactNormal, BABYLON.Vector3.UpReadOnly)) : 0;
                this.climbContactDistance = (pick != null && pick.hit) ? pick.distance : -1;
            }
            // Climbing Draw Debug Line
            if (this.showDebugColliders === true) {
                if (this.climbSensorLine == null)
                    this.climbSensorLine = new BABYLON.LinesMeshRenderer(this.transform.name + ".ClimbingSensorLine", this.scene);
                if (this.climbContact === true) {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, pick.pickedPoint], BABYLON.Color3.Red());
                }
                else {
                    this.climbSensorLine.drawLine([this.startClimbRaycastPosition, this.endClimbRaycastPosition], BABYLON.Color3.Green());
                }
            }
        };
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  Private Worker Functions
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        StandardPlayerController.prototype.getActualVerticalVelocity = function () {
            return (this.m_actualVelocity.y / this.deltaTime); // TODO: Calculate BETTER Vertical Velocity For Non Physics Player
        };
        StandardPlayerController.prototype.getCheckedVerticalVelocity = function () {
            var currentVelocity = (this.characterController != null) ? this.characterController.getVerticalVelocity() : this.getActualVerticalVelocity();
            return (Math.abs(currentVelocity) >= PROJECT.StandardPlayerController.MIN_VERTICAL_VELOCITY) ? currentVelocity : 0;
        };
        StandardPlayerController.prototype.destroyPlayerController = function () {
            this.cameraPivot = null;
            this.cameraNode = null;
            this.animationState = null;
            this.characterController = null;
            this.onPreUpdateObservable.clear();
            this.onPreUpdateObservable = null;
            this.onBeforeMoveObservable.clear();
            this.onBeforeMoveObservable = null;
            this.onPostUpdateObservable.clear();
            this.onPostUpdateObservable = null;
        };
        StandardPlayerController.prototype.validateAnimationStateParams = function () {
            if (this.animationStateParams == null) {
                this.animationStateParams = {
                    moveDirection: "Direction",
                    inputMagnitude: "Magnitude",
                    horizontalInput: "Horizontal",
                    verticalInput: "Vertical",
                    mouseXInput: "MouseX",
                    mouseYInput: "MouseY",
                    heightInput: "Height",
                    speedInput: "Speed",
                    jumpInput: "Jump",
                    jumpState: "Jumping",
                    fallingState: "Falling",
                    slidingState: "Sliding",
                    specialState: "Special",
                    groundedState: "Grounded"
                };
            }
        };
        StandardPlayerController.MIN_VERTICAL_VELOCITY = 0.01;
        StandardPlayerController.MIN_GROUND_DISTANCE = 0.15;
        StandardPlayerController.MIN_MOVE_EPSILON = 0.001;
        StandardPlayerController.MIN_SLOPE_LIMIT = 0;
        return StandardPlayerController;
    }(BABYLON.ScriptComponent));
    PROJECT.StandardPlayerController = StandardPlayerController;
    /**
    * Babylon Enum Definition
    * @interface PlayerInputControl
    */
    var PlayerInputControl;
    (function (PlayerInputControl) {
        PlayerInputControl[PlayerInputControl["FirstPersonStrafing"] = 0] = "FirstPersonStrafing";
        PlayerInputControl[PlayerInputControl["ThirdPersonStrafing"] = 1] = "ThirdPersonStrafing";
        PlayerInputControl[PlayerInputControl["ThirdPersonTurning"] = 2] = "ThirdPersonTurning";
        PlayerInputControl[PlayerInputControl["ThirdPersonForward"] = 3] = "ThirdPersonForward";
    })(PlayerInputControl = PROJECT.PlayerInputControl || (PROJECT.PlayerInputControl = {}));
    /**
    * Babylon Enum Definition
    * @interface PlayerMoveDirection
    */
    var PlayerMoveDirection;
    (function (PlayerMoveDirection) {
        PlayerMoveDirection[PlayerMoveDirection["Stationary"] = 0] = "Stationary";
        PlayerMoveDirection[PlayerMoveDirection["Forward"] = 1] = "Forward";
        PlayerMoveDirection[PlayerMoveDirection["ForwardLeft"] = 2] = "ForwardLeft";
        PlayerMoveDirection[PlayerMoveDirection["ForwardRight"] = 3] = "ForwardRight";
        PlayerMoveDirection[PlayerMoveDirection["Backward"] = 4] = "Backward";
        PlayerMoveDirection[PlayerMoveDirection["BackwardLeft"] = 5] = "BackwardLeft";
        PlayerMoveDirection[PlayerMoveDirection["BackwardRight"] = 6] = "BackwardRight";
        PlayerMoveDirection[PlayerMoveDirection["StrafingLeft"] = 7] = "StrafingLeft";
        PlayerMoveDirection[PlayerMoveDirection["StrafingRight"] = 8] = "StrafingRight";
    })(PlayerMoveDirection = PROJECT.PlayerMoveDirection || (PROJECT.PlayerMoveDirection = {}));
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
    * Babylon Script Component
    * @class FxParticleSystem
    */
    var FxParticleSystem = /** @class */ (function (_super) {
        __extends(FxParticleSystem, _super);
        function FxParticleSystem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.m_particleEmitter = null;
            _this.m_particleSystem = null;
            return _this;
        }
        FxParticleSystem.prototype.getParticleEmitter = function () { return this.m_particleEmitter; };
        FxParticleSystem.prototype.getParticleSystem = function () { return this.m_particleSystem; };
        FxParticleSystem.prototype.awake = function () {
            var rootUrl = BABYLON.SceneManager.GetRootUrl(this.scene);
            var classType = this.getProperty("classType", 0);
            var particleText = this.getProperty("base64ParticleSystem");
            var playOnAwake = this.getProperty("playOnAwake", false);
            var particleTexture = this.getProperty("particleTexture");
            this.m_particleEmitter = this.getAbstractMesh();
            if (this.m_particleEmitter == null) {
                this.m_particleEmitter = BABYLON.Mesh.CreateBox(this.transform.name + ".Emitter", 0.25, this.scene);
                this.m_particleEmitter.parent = this.transform;
                this.m_particleEmitter.position.set(0, 0, 0);
                this.m_particleEmitter.isVisible = false;
                this.m_particleEmitter.isPickable = false;
                this.m_particleEmitter.material = BABYLON.Utilities.GetColliderMaterial(this.scene);
            }
            if (particleText != null && particleText !== "") {
                var particleJson = window.atob(particleText);
                if (particleJson != null && particleJson !== "") {
                    var particleParsed = JSON.parse(particleJson);
                    if (particleParsed != null) {
                        if (particleParsed.texture != null && particleTexture != null) {
                            particleParsed.texture.name = particleTexture.filename; // Note: Particle System Parser Use Name Not Url
                            particleParsed.texture.url = particleTexture.filename; // Note: Particle System Parser Use Name Not Url
                        }
                        if (classType === 1) { // GPU Particle System
                            this.m_particleSystem = BABYLON.GPUParticleSystem.Parse(particleParsed, this.scene, rootUrl);
                        }
                        else { // CPU Particle System
                            this.m_particleSystem = BABYLON.ParticleSystem.Parse(particleParsed, this.scene, rootUrl);
                        }
                        if (this.m_particleSystem != null) {
                            if (this.m_particleEmitter != null)
                                this.m_particleSystem.emitter = this.m_particleEmitter;
                            if (playOnAwake === false)
                                this.m_particleSystem.stop();
                        }
                    }
                }
            }
        };
        FxParticleSystem.prototype.destroy = function () {
            this.m_particleEmitter = null;
            if (this.m_particleSystem != null) {
                this.m_particleSystem.dispose();
                this.m_particleSystem = null;
            }
        };
        return FxParticleSystem;
    }(BABYLON.ScriptComponent));
    PROJECT.FxParticleSystem = FxParticleSystem;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon water material system pro class (Babylon Water Material)
     * @class SkyMaterialSystem - All rights reserved (c) 2020 Mackey Kinard
     */
    var SkyMaterialSystem = /** @class */ (function (_super) {
        __extends(SkyMaterialSystem, _super);
        function SkyMaterialSystem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.skyfog = false;
            _this.skysize = 1000;
            _this.probesize = 128;
            _this.reflections = false;
            _this.reflectlevel = 1;
            _this.skytintcolor = new BABYLON.Color3(1, 1, 1);
            _this.m_skyboxMesh = null;
            _this.m_skyMaterial = null;
            _this.m_reflectProbe = null;
            return _this;
        }
        SkyMaterialSystem.prototype.getSkyboxMesh = function () { return this.m_skyboxMesh; };
        SkyMaterialSystem.prototype.getSkyMaterial = function () { return this.m_skyMaterial; };
        SkyMaterialSystem.prototype.getReflectionProbe = function () { return this.m_reflectProbe; };
        SkyMaterialSystem.prototype.awake = function () { this.awakeSkyboxMaterial(); };
        SkyMaterialSystem.prototype.start = function () { };
        SkyMaterialSystem.prototype.update = function () { };
        SkyMaterialSystem.prototype.late = function () { };
        SkyMaterialSystem.prototype.after = function () { };
        SkyMaterialSystem.prototype.destroy = function () { this.destroySkyboxMaterial(); };
        SkyMaterialSystem.prototype.awakeSkyboxMaterial = function () {
            this.skyfog = this.getProperty("applyMeshFog", this.skyfog);
            this.skysize = this.getProperty("boxSize", this.skysize);
            this.probesize = this.getProperty("probeSize", this.probesize);
            this.reflections = this.getProperty("reflections", this.reflections);
            this.reflectlevel = this.getProperty("reflectLevel", this.reflectlevel);
            // ..
            var tintColor = this.getProperty("tintColor");
            if (tintColor != null)
                this.skytintcolor = BABYLON.Utilities.ParseColor3(tintColor);
            // ..
            this.m_skyboxMesh = BABYLON.Mesh.CreateBox("Ambient Skybox", this.skysize, this.scene);
            this.m_skyboxMesh.position.set(0, 0, 0);
            this.m_skyboxMesh.infiniteDistance = true;
            this.m_skyboxMesh.applyFog = this.skyfog;
            if (this.scene.useRightHandedSystem === true)
                this.m_skyboxMesh.scaling.x *= -1;
            // Setup Sky Material Properties
            this.m_skyMaterial = new BABYLON.SkyMaterial(this.transform.name + ".SkyMaterial", this.scene);
            this.m_skyMaterial.backFaceCulling = false;
            this.setSkyboxTintColor(this.skytintcolor);
            /**
             * Defines the overall luminance of sky in interval [0, 1].
             */
            this.m_skyMaterial.luminance = this.getProperty("luminance", this.m_skyMaterial.luminance);
            /**
            * Defines the amount (scattering) of haze as opposed to molecules in atmosphere.
            */
            this.m_skyMaterial.turbidity = this.getProperty("turbidity", this.m_skyMaterial.turbidity);
            /**
             * Defines the sky appearance (light intensity).
             */
            this.m_skyMaterial.rayleigh = this.getProperty("rayleigh", this.m_skyMaterial.rayleigh);
            /**
             * Defines the mieCoefficient in interval [0, 0.1] which affects the property .mieDirectionalG.
             */
            this.m_skyMaterial.mieCoefficient = this.getProperty("mieCoefficient", this.m_skyMaterial.mieCoefficient);
            /**
             * Defines the amount of haze particles following the Mie scattering theory.
             */
            this.m_skyMaterial.mieDirectionalG = this.getProperty("mieDirectionalG", this.m_skyMaterial.mieDirectionalG);
            /**
             * Defines the distance of the sun according to the active scene camera.
             */
            this.m_skyMaterial.distance = this.getProperty("distance", this.m_skyMaterial.distance);
            /**
             * Defines the sun inclination, in interval [-0.5, 0.5]. When the inclination is not 0, the sun is said
             * "inclined".
             */
            this.m_skyMaterial.inclination = this.getProperty("inclination", this.m_skyMaterial.inclination);
            /**
             * Defines the solar azimuth in interval [0, 1]. The azimuth is the angle in the horizontal plan between
             * an object direction and a reference direction.
             */
            this.m_skyMaterial.azimuth = this.getProperty("azimuth", this.m_skyMaterial.azimuth);
            /**
             * Defines an offset vector used to get a horizon offset.
             * @example skyMaterial.cameraOffset.y = camera.globalPosition.y // Set horizon relative to 0 on the Y axis
             */
            var camOffsetData = this.getProperty("cameraOffset");
            if (camOffsetData != null)
                this.m_skyMaterial.cameraOffset = BABYLON.Utilities.ParseVector3(camOffsetData);
            /**
             * Defines if the sun position should be computed (inclination and azimuth) according to the scene
             * sun position.
             */
            this.m_skyMaterial.useSunPosition = this.getProperty("useSunPosition", this.m_skyMaterial.useSunPosition);
            this.m_skyMaterial.sunPosition = new BABYLON.Vector3(0, 50, 0);
            if (this.scene.metadata != null && this.scene.metadata.unity != null && this.scene.metadata.unity) {
                if (this.scene.metadata.unity.sunposition != null) {
                    this.m_skyMaterial.sunPosition = BABYLON.Utilities.ParseVector3(this.scene.metadata.unity.sunposition);
                }
            }
            // Assign Sky Material To Skybox Mesh
            this.m_skyboxMesh.material = this.m_skyMaterial;
            // Setup Environment Reflection Probe Texture
            if (this.reflections === true) {
                this.m_reflectProbe = new BABYLON.ReflectionProbe("Skybox-ReflectionProbe", this.probesize, this.scene);
                this.m_reflectProbe.renderList.push(this.m_skyboxMesh);
                this.scene.customRenderTargets.push(this.m_reflectProbe.cubeTexture);
                this.scene.environmentTexture = this.m_reflectProbe.cubeTexture;
                this.scene.environmentIntensity = this.reflectlevel;
            }
        };
        SkyMaterialSystem.prototype.destroySkyboxMaterial = function () {
            if (this.m_skyboxMesh != null) {
                this.m_skyboxMesh.dispose();
                this.m_skyboxMesh = null;
            }
            if (this.m_reflectProbe != null) {
                this.m_reflectProbe.dispose();
                this.m_reflectProbe = null;
            }
            if (this.m_skyMaterial != null) {
                this.m_skyMaterial.dispose();
                this.m_skyMaterial = null;
            }
        };
        /** Set Skybox Mesh tint color. (Box Mesh Vertex Colors) */
        SkyMaterialSystem.prototype.setSkyboxTintColor = function (color) {
            var colors = [];
            var numVertices = this.m_skyboxMesh.getTotalVertices();
            for (var i = 0; i < numVertices; ++i) {
                colors.push(color.r, color.g, color.b, 1.0);
            }
            this.m_skyboxMesh.setVerticesData("color", colors);
            this.m_skyboxMesh.useVertexColors = true;
        };
        return SkyMaterialSystem;
    }(BABYLON.ScriptComponent));
    PROJECT.SkyMaterialSystem = SkyMaterialSystem;
})(PROJECT || (PROJECT = {}));
var PROJECT;
(function (PROJECT) {
    /**
     * Babylon water material system pro class (Babylon Water Material)
     * @class WaterMaterialSystem - All rights reserved (c) 2020 Mackey Kinard
     */
    var WaterMaterialSystem = /** @class */ (function (_super) {
        __extends(WaterMaterialSystem, _super);
        function WaterMaterialSystem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.waterTag = "Water";
            _this.targetSize = new BABYLON.Vector2(128, 128);
            _this.renderSize = new BABYLON.Vector2(512, 512);
            _this.depthFactor = 1.0;
            _this.reflectSkybox = true;
            _this.subDivisions = 32;
            _this.heightOffset = 1.0;
            _this.windDirection = new BABYLON.Vector2(0, 1);
            _this.windForce = 6;
            _this.waveSpeed = 1.0;
            _this.waveLength = 0.4;
            _this.waveHeight = 0.4;
            _this.bumpHeight = 0.4;
            _this.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
            _this.colorBlendFactor = 0.2;
            _this.waterColor2 = new BABYLON.Color3(0.1, 0.1, 0.6);
            _this.colorBlendFactor2 = 0.2;
            _this.disableClipPlane = false;
            _this.m_waterGeometry = null;
            _this.m_waterMaterial = null;
            return _this;
        }
        WaterMaterialSystem.prototype.getWaterGeometry = function () { return this.m_waterGeometry; };
        WaterMaterialSystem.prototype.getWaterMaterial = function () { return this.m_waterMaterial; };
        WaterMaterialSystem.prototype.awake = function () {
            var _this = this;
            this.waterTag = this.getProperty("waterTag", this.waterTag);
            this.depthFactor = this.getProperty("depthFactor", this.depthFactor);
            this.subDivisions = this.getProperty("subDivisions", this.subDivisions);
            this.heightOffset = this.getProperty("heightOffset", this.heightOffset);
            this.reflectSkybox = this.getProperty("reflectSkybox", this.reflectSkybox);
            this.windForce = this.getProperty("windForce", this.windForce);
            this.waveSpeed = this.getProperty("waveSpeed", this.waveSpeed);
            this.waveLength = this.getProperty("waveLength", this.waveLength);
            this.waveHeight = this.getProperty("waveHeight", this.waveHeight);
            this.bumpHeight = this.getProperty("bumpHeight", this.bumpHeight);
            this.bumpSuperimpose = this.getProperty("bumpSuperimpose", this.bumpSuperimpose);
            this.bumpAffectsReflection = this.getProperty("bumpAffectsReflection", this.bumpAffectsReflection);
            this.colorBlendFactor = this.getProperty("colorBlendFactor", this.colorBlendFactor);
            this.colorBlendFactor2 = this.getProperty("colorBlendFactor2", this.colorBlendFactor2);
            this.disableClipPlane = this.getProperty("disableClipPlane", this.disableClipPlane);
            this.fresnelSeparate = this.getProperty("fresnelSeparate", this.fresnelSeparate);
            // ..
            var wcolor1 = this.getProperty("waterColor");
            this.waterColor = BABYLON.Utilities.ParseColor3(wcolor1);
            // ..
            var wcolor2 = this.getProperty("waterColor2");
            this.waterColor2 = BABYLON.Utilities.ParseColor3(wcolor2);
            // ..
            var wdirection = this.getProperty("windDirection");
            this.windDirection = BABYLON.Utilities.ParseVector2(wdirection);
            // ..
            var itargetsize = this.getProperty("targetSize");
            if (itargetsize != null)
                this.targetSize = BABYLON.Utilities.ParseVector2(itargetsize);
            // ..        
            var irendersize = this.getProperty("renderSize");
            if (irendersize != null)
                this.renderSize = BABYLON.Utilities.ParseVector2(irendersize);
            /* Awake component function */
            var bumpTexture = null;
            var bumpTextureData = this.getProperty("bumpTexture");
            if (bumpTextureData != null)
                bumpTexture = BABYLON.Utilities.ParseTexture(bumpTextureData, this.scene);
            if (bumpTexture != null) {
                this.m_waterMaterial = new BABYLON.WaterMaterial(this.transform.name + ".Water", this.scene, this.renderSize);
                this.m_waterMaterial.bumpTexture = bumpTexture;
                this.m_waterMaterial.windDirection = this.windDirection;
                this.m_waterMaterial.windForce = this.windForce;
                this.m_waterMaterial.waveSpeed = this.waveSpeed;
                this.m_waterMaterial.waveLength = this.waveLength;
                this.m_waterMaterial.waveHeight = this.waveHeight;
                this.m_waterMaterial.bumpHeight = this.bumpHeight;
                this.m_waterMaterial.bumpSuperimpose = this.bumpSuperimpose;
                this.m_waterMaterial.bumpAffectsReflection = this.bumpAffectsReflection;
                this.m_waterMaterial.waterColor = this.waterColor;
                this.m_waterMaterial.colorBlendFactor = this.colorBlendFactor;
                this.m_waterMaterial.waterColor2 = this.waterColor2;
                this.m_waterMaterial.colorBlendFactor2 = this.colorBlendFactor2;
                this.m_waterMaterial.disableClipPlane = this.disableClipPlane;
                this.m_waterMaterial.fresnelSeparate = this.fresnelSeparate;
                // ..
                // Water Material Tags
                // ..
                if (this.reflectSkybox === true) {
                    var skyboxMesh = BABYLON.SceneManager.GetAmbientSkybox(this.scene);
                    if (skyboxMesh != null)
                        this.m_waterMaterial.addToRenderList(skyboxMesh);
                }
                if (this.waterTag != null && this.waterTag !== "") {
                    var waterMeshes = this.scene.getMeshesByTags(this.waterTag);
                    if (waterMeshes != null && waterMeshes.length > 0) {
                        waterMeshes.forEach(function (mesh) {
                            _this.m_waterMaterial.addToRenderList(mesh);
                        });
                    }
                }
                // ..
                // Water Material Mesh
                // ..
                this.m_waterGeometry = BABYLON.Mesh.CreateGround(this.transform.name + ".WaterMesh", this.targetSize.x, this.targetSize.y, this.subDivisions, this.scene, false);
                this.m_waterGeometry.parent = this.transform;
                this.m_waterGeometry.position.set(0, this.heightOffset, 0);
                if (this.depthFactor > 0)
                    this.m_waterGeometry.scaling.y *= this.depthFactor;
                this.m_waterGeometry.material = this.m_waterMaterial;
            }
            else {
                BABYLON.SceneManager.LogWarning("No supported water bump texture for: " + this.transform.name);
            }
        };
        WaterMaterialSystem.prototype.start = function () { };
        WaterMaterialSystem.prototype.update = function () { };
        WaterMaterialSystem.prototype.late = function () { };
        WaterMaterialSystem.prototype.after = function () { };
        WaterMaterialSystem.prototype.destroy = function () { };
        return WaterMaterialSystem;
    }(BABYLON.ScriptComponent));
    PROJECT.WaterMaterialSystem = WaterMaterialSystem;
})(PROJECT || (PROJECT = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon windows platform pro class
     * @class WindowsPlatform - All rights reserved (c) 2020 Mackey Kinard
     */
    var WindowsPlatform = /** @class */ (function () {
        function WindowsPlatform() {
        }
        /** Is xbox live user signed in if platform services enabled. (WinRT) */
        WindowsPlatform.IsXboxLiveUserSignedIn = function (systemUser, player) {
            if (systemUser === void 0) { systemUser = null; }
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.WindowManager.IsWindows()) {
                var user = (systemUser != null) ? BABYLON.WindowsPlatform.GetXboxLiveSystemUser(systemUser, player) : BABYLON.WindowsPlatform.GetXboxLiveUser(player);
                return (user != null && user.isSignedIn == true);
            }
            else {
                return false;
            }
        };
        /** Validated sign in xbox live user if platform services available. (WinRT) */
        WindowsPlatform.XboxLiveUserSignIn = function (player, oncomplete, onerror, onprogress) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.WindowManager.IsWindows()) {
                BABYLON.WindowsPlatform.XboxLiveUserSilentSignIn(player, function (first) {
                    if (first.status === Microsoft.Xbox.Services.System.SignInStatus.userInteractionRequired) {
                        BABYLON.WindowsPlatform.XboxLiveUserDialogSignIn(player, function (second) {
                            if (oncomplete)
                                oncomplete(second);
                        }, onerror, onprogress);
                    }
                    else {
                        if (oncomplete)
                            oncomplete(first);
                    }
                }, onerror, onprogress);
            }
        };
        /** Silent sign in xbox live user if platform services available. (WinRT) */
        WindowsPlatform.XboxLiveUserSilentSignIn = function (player, oncomplete, onerror, onprogress) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            return (BABYLON.WindowManager.IsWindows()) ? BABYLON.WindowsPlatform.GetXboxLiveUser(player).signInSilentlyAsync(null).then(oncomplete, onerror, onprogress) : null;
        };
        /** Dialog sign in xbox live user if platform services available. (WinRT) */
        WindowsPlatform.XboxLiveUserDialogSignIn = function (player, oncomplete, onerror, onprogress) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            return (BABYLON.WindowManager.IsWindows()) ? BABYLON.WindowsPlatform.GetXboxLiveUser(player).signInAsync(null).then(oncomplete, onerror, onprogress) : null;
        };
        /** Loads a xbox live user profile if platform services available. (WinRT) */
        WindowsPlatform.LoadXboxLiveUserProfile = function (player, oncomplete, onerror, onprogress) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            return (BABYLON.WindowManager.IsWindows()) ? BABYLON.WindowsPlatform.GetXboxLiveUserContext(player).profileService.getUserProfileAsync(BABYLON.WindowsPlatform.GetXboxLiveUser(player).xboxUserId).then(oncomplete, onerror, onprogress) : null;
        };
        // ************************************** //
        // * Babylon Xbox Live Player Functions * //
        // ************************************** //
        /** Get xbox live user if platform services available. (WinRT) */
        WindowsPlatform.GetXboxLiveUser = function (player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var user = null;
            if (BABYLON.WindowManager.IsWindows()) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserOne();
                        break;
                    case BABYLON.PlayerNumber.Two:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserTwo();
                        break;
                    case BABYLON.PlayerNumber.Three:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserThree();
                        break;
                    case BABYLON.PlayerNumber.Four:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveUserFour();
                        break;
                }
            }
            return user;
        };
        /** Get xbox live user if platform services available. (WinRT) */
        WindowsPlatform.GetXboxLiveSystemUser = function (systemUser, player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var user = null;
            if (BABYLON.WindowManager.IsWindows()) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserOne(systemUser);
                        break;
                    case BABYLON.PlayerNumber.Two:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserTwo(systemUser);
                        break;
                    case BABYLON.PlayerNumber.Three:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserThree(systemUser);
                        break;
                    case BABYLON.PlayerNumber.Four:
                        user = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveSystemUserFour(systemUser);
                        break;
                }
            }
            return user;
        };
        /** Get xbox live user context if platform services available. (WinRT) */
        WindowsPlatform.GetXboxLiveUserContext = function (player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            var context = null;
            if (BABYLON.WindowManager.IsWindows()) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextOne();
                        break;
                    case BABYLON.PlayerNumber.Two:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextTwo();
                        break;
                    case BABYLON.PlayerNumber.Three:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextThree();
                        break;
                    case BABYLON.PlayerNumber.Four:
                        context = window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextFour();
                        break;
                }
            }
            return context;
        };
        /** Resets xbox live user context if platform services available. (WinRT) */
        WindowsPlatform.ResetXboxLiveUserContext = function (player) {
            if (player === void 0) { player = BABYLON.PlayerNumber.One; }
            if (BABYLON.WindowManager.IsWindows()) {
                switch (player) {
                    case BABYLON.PlayerNumber.One:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextOne();
                        break;
                    case BABYLON.PlayerNumber.Two:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextTwo();
                        break;
                    case BABYLON.PlayerNumber.Three:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextThree();
                        break;
                    case BABYLON.PlayerNumber.Four:
                        window.BabylonToolkit.XboxLive.Plugin.resetXboxLiveUserContextFour();
                        break;
                }
            }
        };
        // *************************************** //
        // * Babylon Xbox Live Context Functions * //
        // *************************************** //
        /** Get xbox live context property if platform services available. (WinRT) */
        WindowsPlatform.GetXboxLiveContextProperty = function (name) {
            return (BABYLON.WindowManager.IsWindows()) ? window.BabylonToolkit.XboxLive.Plugin.getXboxLiveContextProperty(name) : null;
        };
        /** Get xbox live context property if platform services available. (WinRT) */
        WindowsPlatform.SetXboxLiveContextProperty = function (name, property) {
            if (BABYLON.WindowManager.IsWindows()) {
                window.BabylonToolkit.XboxLive.Plugin.setXboxLiveContextProperty(name, property);
            }
        };
        /** Resets xbox live property context bag if platform services available. (WinRT) */
        WindowsPlatform.ResetXboxLivePropertyContexts = function () {
            if (BABYLON.WindowManager.IsWindows()) {
                window.BabylonToolkit.XboxLive.Plugin.resetXboxLivePropertyContexts();
            }
        };
        // **************************************** //
        // * Babylon Xbox Live Sign Out Functions * //
        // **************************************** //
        /** Sets the Xbox User Sign Out Complete Handler (WinRT) */
        WindowsPlatform.SetXboxLiveSignOutHandler = function (handler) {
            if (handler === void 0) { handler = null; }
            if (BABYLON.WindowManager.IsWindows()) {
                window.BabylonToolkit.XboxLive.Plugin.onusersignout = handler;
            }
        };
        return WindowsPlatform;
    }());
    BABYLON.WindowsPlatform = WindowsPlatform;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon animation state pro class (Unity Style Mechanim Animation System)
     * @class AnimationState - All rights reserved (c) 2020 Mackey Kinard
     */
    var AnimationState = /** @class */ (function (_super) {
        __extends(AnimationState, _super);
        function AnimationState() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._frametime = 0;
            _this._layercount = 0;
            _this._updatemode = 0; // Note: 0 - Transform Node | 1 - Chacracter Controller | 2 - Unscaled Time ???
            _this._hasrootmotion = false;
            _this._animationplaying = false;
            _this._initialtargetblending = false;
            _this._hastransformhierarchy = false;
            _this._leftfeetbottomheight = 0;
            _this._rightfeetbottomheight = 0;
            _this._initialRootBonePosition = null;
            _this._initialRootBoneRotation = null;
            _this._runtimecontroller = null;
            _this._executed = false;
            _this._checkers = new BABYLON.TransitionCheck();
            _this._source = "";
            _this._machine = null;
            _this._deltaPosition = new BABYLON.Vector3(0, 0, 0);
            _this._deltaRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._positionWeight = false;
            _this._rootBoneWeight = false;
            _this._rotationWeight = false;
            _this._rootQuatWeight = false;
            _this._angularVelocity = new BABYLON.Vector3(0, 0, 0);
            _this._positionHolder = new BABYLON.Vector3(0, 0, 0);
            _this._rootBoneHolder = new BABYLON.Vector3(0, 0, 0);
            _this._rotationHolder = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._rootQuatHolder = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._rootMotionMatrix = BABYLON.Matrix.Zero();
            _this._rootMotionScaling = new BABYLON.Vector3(0, 0, 0);
            _this._rootMotionRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._rootMotionPosition = new BABYLON.Vector3(0, 0, 0);
            _this._lastMotionRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._lastMotionPosition = new BABYLON.Vector3(0, 0, 0);
            _this._deltaPositionFixed = new BABYLON.Vector3(0, 0, 0);
            _this._deltaPositionMatrix = new BABYLON.Matrix();
            _this._saveDeltaPosition = new BABYLON.Vector3(0, 0, 0);
            _this._saveDeltaRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._dirtyMotionMatrix = null;
            _this._dirtyBlenderMatrix = null;
            //private _bodyOrientationAngleY:number = 0;
            //private transformForwardVector:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private transformRightVector:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private desiredForwardVector:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            //private desiredRightVector:BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
            _this._targetPosition = new BABYLON.Vector3(0, 0, 0);
            _this._targetRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._targetScaling = new BABYLON.Vector3(1, 1, 1);
            _this._updateMatrix = BABYLON.Matrix.Zero();
            _this._blenderMatrix = BABYLON.Matrix.Zero();
            _this._blendWeights = new BABYLON.BlendingWeights();
            _this._emptyScaling = new BABYLON.Vector3(1, 1, 1);
            _this._emptyPosition = new BABYLON.Vector3(0, 0, 0);
            _this._emptyRotation = new BABYLON.Quaternion(0, 0, 0, 1);
            _this._ikFrameEanbled = false;
            _this._data = new Map();
            _this._anims = new Map();
            _this._numbers = new Map();
            _this._booleans = new Map();
            _this._triggers = new Map();
            _this._parameters = new Map();
            _this.speedRatio = 1.0;
            _this.applyRootMotion = false;
            _this.delayUpdateUntilReady = true;
            _this.enableAnimation = true;
            _this.updateRootMotionPosition = false;
            _this.updateRootMotionRotation = false;
            /** Register handler that is triggered when the animation ik setup has been triggered */
            _this.onAnimationIKObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the animation end has been triggered */
            _this.onAnimationEndObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the animation loop has been triggered */
            _this.onAnimationLoopObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the animation event has been triggered */
            _this.onAnimationEventObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the animation frame has been updated */
            _this.onAnimationUpdateObservable = new BABYLON.Observable();
            _this.m_defaultGroup = null;
            _this.m_animationTargets = null;
            _this.m_characterController = null;
            return _this;
        }
        AnimationState.prototype.hasRootMotion = function () { return this._hasrootmotion; };
        AnimationState.prototype.ikFrameEnabled = function () { return this._ikFrameEanbled; };
        AnimationState.prototype.getAnimationTime = function () { return this._frametime; };
        AnimationState.prototype.getAnimationPlaying = function () { return this._animationplaying; };
        AnimationState.prototype.getRootMotionAngle = function () { return this._angularVelocity.y; };
        AnimationState.prototype.getRootMotionSpeed = function () { return this._deltaPosition.length(); };
        AnimationState.prototype.getRootMotionPosition = function () { return this._deltaPositionFixed; };
        AnimationState.prototype.getRootMotionRotation = function () { return this._deltaRotation; };
        AnimationState.prototype.getCharacterController = function () { return this.m_characterController; };
        AnimationState.prototype.getRuntimeController = function () { return this._runtimecontroller; };
        AnimationState.prototype.awake = function () { this.awakeStateMachine(); };
        AnimationState.prototype.update = function () { this.updateStateMachine(); };
        AnimationState.prototype.destroy = function () { this.destroyStateMachine(); };
        /////////////////////////////////////////////////////////////////////////////////////
        // State Machine Functions
        /////////////////////////////////////////////////////////////////////////////////////
        AnimationState.prototype.playAnimation = function (state, transitionDuration, animationLayer, frameRate) {
            if (transitionDuration === void 0) { transitionDuration = 0; }
            if (animationLayer === void 0) { animationLayer = 0; }
            if (frameRate === void 0) { frameRate = null; }
            var result = false;
            if (this._machine.layers != null && this._machine.layers.length > animationLayer) {
                var layer = this._machine.layers[animationLayer];
                var blendFrameRate = (layer.animationStateMachine != null) ? (layer.animationStateMachine.rate || BABYLON.AnimationState.FPS) : BABYLON.AnimationState.FPS;
                var blendingSpeed = (transitionDuration > 0) ? BABYLON.Utilities.ComputeBlendingSpeed(frameRate || blendFrameRate, transitionDuration) : 0;
                this.playCurrentAnimationState(layer, state, blendingSpeed);
                result = true;
            }
            else {
                BABYLON.Tools.Warn("No animation state layers on " + this.transform.name);
            }
            return result;
        };
        AnimationState.prototype.stopAnimation = function (animationLayer) {
            if (animationLayer === void 0) { animationLayer = 0; }
            var result = false;
            if (this._machine.layers != null && this._machine.layers.length > animationLayer) {
                var layer = this._machine.layers[animationLayer];
                this.stopCurrentAnimationState(layer);
                result = true;
            }
            else {
                BABYLON.Tools.Warn("No animation state layers on " + this.transform.name);
            }
            return result;
        };
        /////////////////////////////////////////////////////////////////////////////////////
        // State Machine Functions
        /////////////////////////////////////////////////////////////////////////////////////
        AnimationState.prototype.getBool = function (name) {
            return this._booleans.get(name) || false;
        };
        AnimationState.prototype.setBool = function (name, value) {
            this._booleans.set(name, value);
        };
        AnimationState.prototype.getFloat = function (name) {
            return this._numbers.get(name) || 0;
        };
        AnimationState.prototype.setFloat = function (name, value) {
            this._numbers.set(name, value);
        };
        AnimationState.prototype.getInteger = function (name) {
            return this._numbers.get(name) || 0;
        };
        AnimationState.prototype.setInteger = function (name, value) {
            this._numbers.set(name, value);
        };
        AnimationState.prototype.getTrigger = function (name) {
            return this._triggers.get(name) || false;
        };
        AnimationState.prototype.setTrigger = function (name) {
            this._triggers.set(name, true);
        };
        AnimationState.prototype.resetTrigger = function (name) {
            this._triggers.set(name, false);
        };
        AnimationState.prototype.setSmoothFloat = function (name, targetValue, dampTime, deltaTime) {
            var currentValue = this.getFloat(name);
            var gradientValue = BABYLON.Scalar.Lerp(currentValue, targetValue, (dampTime * deltaTime));
            this._numbers.set(name, gradientValue);
        };
        AnimationState.prototype.setSmoothInteger = function (name, targetValue, dampTime, deltaTime) {
            var currentValue = this.getInteger(name);
            var gradientValue = BABYLON.Scalar.Lerp(currentValue, targetValue, (dampTime * deltaTime));
            this._numbers.set(name, gradientValue);
        };
        AnimationState.prototype.getMachineState = function (name) {
            return this._data.get(name);
        };
        AnimationState.prototype.setMachineState = function (name, value) {
            this._data.set(name, value);
        };
        AnimationState.prototype.getCurrentState = function (layer) {
            return (this._machine.layers != null && this._machine.layers.length > layer) ? this._machine.layers[layer].animationStateMachine : null;
        };
        AnimationState.prototype.getAnimationGroup = function (name) {
            return this._anims.get(name);
        };
        AnimationState.prototype.getAnimationGroups = function () {
            return this._anims;
        };
        AnimationState.prototype.setAnimationGroups = function (groups, remapTargets) {
            var _this = this;
            if (remapTargets === void 0) { remapTargets = false; }
            // ..
            // TODO - Handle Remap Animation Targets
            // ..
            if (groups != null && groups.length > 0) {
                this._anims = new Map();
                this.m_animationTargets = [];
                this.m_defaultGroup = groups[0];
                groups.forEach(function (group) {
                    var agroup = group;
                    try {
                        group.stop();
                    }
                    catch (_a) { }
                    if (group.targetedAnimations != null && group.targetedAnimations.length > 0) {
                        group.targetedAnimations.forEach(function (targetedAnimation) {
                            // Note: For Loop Faster Than IndexOf
                            var indexOfTarget = -1;
                            for (var i = 0; i < _this.m_animationTargets.length; i++) {
                                if (_this.m_animationTargets[i].target === targetedAnimation.target) {
                                    indexOfTarget = i;
                                    break;
                                }
                            }
                            if (indexOfTarget < 0) {
                                _this.m_animationTargets.push(targetedAnimation);
                                if (targetedAnimation.target.metadata == null)
                                    targetedAnimation.target.metadata = {};
                                if (targetedAnimation.target instanceof BABYLON.TransformNode) {
                                    BABYLON.Utilities.ValidateTransformQuaternion(targetedAnimation.target);
                                    var layerMixers = [];
                                    for (var index = 0; index < _this._layercount; index++) {
                                        var layerMixer = new BABYLON.AnimationMixer();
                                        layerMixer.positionBuffer = null;
                                        layerMixer.rotationBuffer = null;
                                        layerMixer.scalingBuffer = null;
                                        layerMixer.originalMatrix = null;
                                        layerMixer.blendingFactor = 0;
                                        layerMixer.blendingSpeed = 0;
                                        layerMixer.rootPosition = null;
                                        layerMixer.rootRotation = null;
                                        layerMixers.push(layerMixer);
                                    }
                                    targetedAnimation.target.metadata.mixer = layerMixers;
                                }
                                else if (targetedAnimation.target instanceof BABYLON.MorphTarget) {
                                    var morphLayerMixers = [];
                                    for (var index = 0; index < _this._layercount; index++) {
                                        var morphLayerMixer = new BABYLON.AnimationMixer();
                                        morphLayerMixer.influenceBuffer = null;
                                        morphLayerMixers.push(morphLayerMixer);
                                    }
                                    targetedAnimation.target.metadata.mixer = morphLayerMixers;
                                }
                            }
                        });
                    }
                    if (agroup != null && agroup.metadata != null && agroup.metadata.unity != null && agroup.metadata.unity.clip != null && agroup.metadata.unity.clip !== "") {
                        _this._anims.set(agroup.metadata.unity.clip, group);
                    }
                });
            }
        };
        /* Animation Controller State Machine Functions */
        AnimationState.prototype.awakeStateMachine = function () {
            var _this = this;
            BABYLON.Utilities.ValidateTransformQuaternion(this.transform);
            this.m_animationTargets = [];
            this.m_defaultGroup = null;
            this.m_characterController = this.getComponent("BABYLON.CharacterController");
            // ..
            this._source = (this.transform.metadata != null && this.transform.metadata.unity != null && this.transform.metadata.unity.animator != null && this.transform.metadata.unity.animator !== "") ? this.transform.metadata.unity.animator : null;
            this._machine = this.getProperty("machine", this._machine);
            this._updatemode = this.getProperty("updatemode", this._updatemode);
            this._hasrootmotion = this.getProperty("hasrootmotion", this._hasrootmotion);
            this._runtimecontroller = this.getProperty("runtimecontroller", this._runtimecontroller);
            this._hastransformhierarchy = this.getProperty("hastransformhierarchy", this._hastransformhierarchy);
            this._leftfeetbottomheight = this.getProperty("leftfeetbottomheight", this._leftfeetbottomheight);
            this._rightfeetbottomheight = this.getProperty("rightfeetbottomheight", this._rightfeetbottomheight);
            this.applyRootMotion = this.getProperty("applyrootmotion", this.applyRootMotion);
            // ..
            if (this._machine != null) {
                if (this._machine.speed != null) {
                    this.speedRatio = this._machine.speed;
                }
                if (this._machine.parameters != null && this._machine.parameters.length > 0) {
                    var plist = this._machine.parameters;
                    plist.forEach(function (parameter) {
                        var name = parameter.name;
                        var type = parameter.type;
                        var curve = parameter.curve;
                        var defaultFloat = parameter.defaultFloat;
                        var defaultBool = parameter.defaultBool;
                        var defaultInt = parameter.defaultInt;
                        _this._parameters.set(name, type);
                        if (type === BABYLON.AnimatorParameterType.Bool) {
                            _this.setBool(name, defaultBool);
                        }
                        else if (type === BABYLON.AnimatorParameterType.Float) {
                            _this.setFloat(name, defaultFloat);
                        }
                        else if (type === BABYLON.AnimatorParameterType.Int) {
                            _this.setInteger(name, defaultInt);
                        }
                        else if (type === BABYLON.AnimatorParameterType.Trigger) {
                            _this.resetTrigger(name);
                        }
                    });
                }
                // ..
                // Process Machine State Layers
                // ..
                if (this._machine.layers != null && this._machine.layers.length > 0) {
                    this._layercount = this._machine.layers.length;
                    // Sort In Ascending Order
                    this._machine.layers.sort(function (left, right) {
                        if (left.index < right.index)
                            return -1;
                        if (left.index > right.index)
                            return 1;
                        return 0;
                    });
                    // Parse State Machine Layers
                    this._machine.layers.forEach(function (layer) {
                        // Set Layer Avatar Mask Transform Path
                        layer.animationMaskMap = new Map();
                        if (layer.avatarMask != null && layer.avatarMask.transformPaths != null && layer.avatarMask.transformPaths.length > 0) {
                            for (var i = 0; i < layer.avatarMask.transformPaths.length; i++) {
                                layer.animationMaskMap.set(layer.avatarMask.transformPaths[i], i);
                            }
                        }
                    });
                }
            }
            if (this._source != null && this._source !== "" && this.scene.animationGroups != null) {
                var sourceanims_1 = null;
                // ..
                // TODO - Optimize Searching Global Animation Groups - ???
                // ..
                this.scene.animationGroups.forEach(function (group) {
                    var agroup = group;
                    if (agroup != null && agroup.metadata != null && agroup.metadata.unity != null && agroup.metadata.unity.source != null && agroup.metadata.unity.source !== "") {
                        if (agroup.metadata.unity.source === _this._source) {
                            if (sourceanims_1 == null)
                                sourceanims_1 = [];
                            sourceanims_1.push(group);
                        }
                    }
                });
                if (sourceanims_1 != null && sourceanims_1.length > 0) {
                    this.setAnimationGroups(sourceanims_1);
                }
            }
            // ..
            // Map State Machine Tracks (Animation Groups)
            // ..
            if (this._machine != null && this._machine.states != null && this._machine.states.length > 0) {
                this._machine.states.forEach(function (state) {
                    if (state != null && state.name != null) {
                        // Set Custom Animation Curves
                        if (state.ccurves != null && state.ccurves.length > 0) {
                            state.ccurves.forEach(function (curve) {
                                if (curve.animation != null) {
                                    var anim = BABYLON.Animation.Parse(curve.animation);
                                    if (anim != null) {
                                        if (state.tcurves == null)
                                            state.tcurves = [];
                                        state.tcurves.push(anim);
                                    }
                                }
                            });
                        }
                        // Setup Animation State Machines
                        _this.setupTreeBranches(state.blendtree);
                        _this.setMachineState(state.name, state);
                    }
                });
            }
            // .. 
            // console.warn("Animation State Mahine: " + this.transform.name);
            // console.log(this);
            // SM.SetWindowState(this.transform.name, this);
        };
        AnimationState.prototype.updateStateMachine = function (deltaTime) {
            var _this = this;
            if (deltaTime === void 0) { deltaTime = null; }
            if (this.delayUpdateUntilReady === false || (this.delayUpdateUntilReady === true && this.getReadyState() === true)) {
                if (this._executed === false) {
                    this._executed = true;
                    if (this._machine.layers != null && this._machine.layers.length > 0) {
                        this._machine.layers.forEach(function (layer) {
                            _this.playCurrentAnimationState(layer, layer.entry, 0);
                        });
                    }
                }
                if (this.enableAnimation === true) {
                    var frameDeltaTime = deltaTime || this.getDeltaSeconds();
                    this.updateAnimationState(frameDeltaTime);
                    this.updateAnimationTargets(frameDeltaTime);
                    if (this.onAnimationUpdateObservable.hasObservers() === true) {
                        this.onAnimationUpdateObservable.notifyObservers(this.transform);
                    }
                }
            }
        };
        AnimationState.prototype.destroyStateMachine = function () {
            this._data = null;
            this._anims = null;
            this._numbers = null;
            this._booleans = null;
            this._triggers = null;
            this._parameters = null;
            this._checkers = null;
            this._machine = null;
            this.onAnimationIKObservable.clear();
            this.onAnimationIKObservable = null;
            this.onAnimationEndObservable.clear();
            this.onAnimationEndObservable = null;
            this.onAnimationLoopObservable.clear();
            this.onAnimationLoopObservable = null;
            this.onAnimationEventObservable.clear();
            this.onAnimationEventObservable = null;
            this.onAnimationUpdateObservable.clear();
            this.onAnimationUpdateObservable = null;
        };
        /* Animation Controller Private Update Functions */
        AnimationState.prototype.updateAnimationState = function (deltaTime) {
            var _this = this;
            if (this._machine.layers != null && this._machine.layers.length > 0) {
                this._machine.layers.forEach(function (layer) {
                    _this.checkStateMachine(layer, deltaTime);
                });
            }
        };
        AnimationState.prototype.updateAnimationTargets = function (deltaTime) {
            var _this = this;
            this._ikFrameEanbled = false; // Reset Current Inverse Kinematics
            this._animationplaying = false; // Reset Current Animation Is Playing
            //this._bodyOrientationAngleY = 0;
            if (this.transform.rotationQuaternion != null) {
                //this._bodyOrientationAngleY = this.transform.rotationQuaternion.toEulerAngles().y; // TODO - OPTIMIZE THIS
            }
            else if (this.transform.rotation != null) {
                //this._bodyOrientationAngleY = this.transform.rotation.y;
            }
            if (this._machine.layers != null && this._machine.layers.length > 0) {
                this._machine.layers.forEach(function (layer) {
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (layer.index === 0)
                        _this._frametime = layer.animationTime; // Note: Update Master Animation Frame Time
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (layer.animationStateMachine != null && layer.animationStateMachine.blendtree != null) {
                        if (layer.iKPass === true) {
                            if (layer.animationStateMachine.iKOnFeet === true) {
                                _this._ikFrameEanbled = true;
                            }
                            if (_this.onAnimationIKObservable.hasObservers() === true) {
                                _this.onAnimationIKObservable.notifyObservers(layer.index);
                            }
                        }
                        var layerState = layer.animationStateMachine;
                        if (layerState.type === BABYLON.MotionType.Clip && layerState.played !== -1)
                            layerState.played += deltaTime;
                        if (layerState.blendtree.children != null && layerState.blendtree.children.length > 0) {
                            var primaryBlendTree = layerState.blendtree.children[0];
                            if (primaryBlendTree != null) {
                                if (layerState.blendtree.blendType == BABYLON.BlendTreeType.Clip) {
                                    var animationTrack = primaryBlendTree.track;
                                    if (animationTrack != null) {
                                        var frameRatio = (BABYLON.AnimationState.TIME / animationTrack.to);
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // Motion Clip Animation Delta Time
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        layer.animationTime += (deltaTime * frameRatio * Math.abs(layerState.speed) * Math.abs(_this.speedRatio) * BABYLON.AnimationState.SPEED);
                                        if (layer.animationTime > BABYLON.AnimationState.TIME)
                                            layer.animationTime = BABYLON.AnimationState.TIME;
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // Motion Clip Animation Normalized Time
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        layer.animationNormal = (layer.animationTime / BABYLON.AnimationState.TIME); // Note: Normalize Layer Frame Time
                                        var validateTime = (layer.animationNormal > 0.99) ? 1 : layer.animationNormal;
                                        var formattedTime_1 = Math.round(validateTime * 100) / 100;
                                        if (layerState.speed < 0)
                                            layer.animationNormal = (1 - layer.animationNormal); // Note: Reverse Normalized Frame Time
                                        var animationFrameTime_1 = (animationTrack.to * layer.animationNormal); // Note: Denormalize Animation Frame Time
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // let additivereferenceposeclip:number = 0;
                                        // let additivereferenceposetime:number = 0.0;
                                        // let hasadditivereferencepose:boolean = false;
                                        // let starttime:number = 0.0;
                                        // let stoptime:number = 0.0;
                                        // let mirror:boolean = false;
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        var level_1 = 0.0;
                                        var xspeed = 0.0;
                                        var zspeed = 0.0;
                                        var looptime = false;
                                        //let loopblend:boolean = false;
                                        //let cycleoffset:number = 0.0;
                                        //let heightfromfeet:boolean = false;
                                        var orientationoffsety_1 = 0.0;
                                        //let keeporiginalorientation:boolean = true;
                                        //let keeporiginalpositiony:boolean = true;
                                        //let keeporiginalpositionxz:boolean = true;
                                        var loopblendorientation_1 = true;
                                        var loopblendpositiony_1 = true;
                                        var loopblendpositionxz_1 = true;
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        var agroup = animationTrack;
                                        if (agroup.metadata != null && agroup.metadata.unity != null) {
                                            if (agroup.metadata.unity.averagespeed != null) {
                                                xspeed = (agroup.metadata.unity.averagespeed.x != null) ? agroup.metadata.unity.averagespeed.x : 0;
                                                zspeed = (agroup.metadata.unity.averagespeed.z != null) ? agroup.metadata.unity.averagespeed.z : 0;
                                            }
                                            if (agroup.metadata.unity.settings != null) {
                                                level_1 = (agroup.metadata.unity.settings.level != null) ? agroup.metadata.unity.settings.level : 0;
                                                looptime = (agroup.metadata.unity.settings.looptime != null) ? agroup.metadata.unity.settings.looptime : false;
                                                // DEPRECIATED: loopblend = (agroup.metadata.unity.settings.loopblend != null) ? agroup.metadata.unity.settings.loopblend : false;
                                                // DEPRECIATED: cycleoffset = (agroup.metadata.unity.settings.cycleoffset != null) ? agroup.metadata.unity.settings.cycleoffset : 0;
                                                // DEPRECIATED: heightfromfeet = (agroup.metadata.unity.settings.heightfromfeet != null) ? agroup.metadata.unity.settings.heightfromfeet : false;
                                                orientationoffsety_1 = (agroup.metadata.unity.settings.orientationoffsety != null) ? agroup.metadata.unity.settings.orientationoffsety : 0;
                                                // DEPRECIATED: keeporiginalorientation = (agroup.metadata.unity.settings.keeporiginalorientation != null) ? agroup.metadata.unity.settings.keeporiginalorientation : true;
                                                // DEPRECIATED: keeporiginalpositiony = (agroup.metadata.unity.settings.keeporiginalpositiony != null) ? agroup.metadata.unity.settings.keeporiginalpositiony : true;
                                                // DEPRECIATED: keeporiginalpositionxz = (agroup.metadata.unity.settings.keeporiginalpositionxz != null) ? agroup.metadata.unity.settings.keeporiginalpositionxz : true;
                                                loopblendorientation_1 = (agroup.metadata.unity.settings.loopblendorientation != null) ? agroup.metadata.unity.settings.loopblendorientation : true;
                                                loopblendpositiony_1 = (agroup.metadata.unity.settings.loopblendpositiony != null) ? agroup.metadata.unity.settings.loopblendpositiony : true;
                                                loopblendpositionxz_1 = (agroup.metadata.unity.settings.loopblendpositionxz != null) ? agroup.metadata.unity.settings.loopblendpositionxz : true;
                                            }
                                        }
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // Unity Inverts Root Motion Animation Offsets
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        orientationoffsety_1 = BABYLON.Tools.ToRadians(orientationoffsety_1);
                                        // DEPRECIATED: orientationoffsety *= -1;
                                        xspeed = Math.abs(xspeed);
                                        zspeed = Math.abs(zspeed);
                                        level_1 *= -1;
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        if (layer.animationTime >= BABYLON.AnimationState.TIME) {
                                            layer.animationFirstRun = false;
                                            layer.animationLoopFrame = true;
                                            if (looptime === true) {
                                                layer.animationLoopCount++;
                                                if (_this.onAnimationLoopObservable.hasObservers() === true) {
                                                    _this.onAnimationLoopObservable.notifyObservers(layer.index);
                                                }
                                            }
                                            else {
                                                if (layer.animationEndFrame === false) {
                                                    layer.animationEndFrame = true;
                                                    if (_this.onAnimationEndObservable.hasObservers() === true) {
                                                        _this.onAnimationEndObservable.notifyObservers(layer.index);
                                                    }
                                                }
                                            }
                                        }
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        if (layer.animationFirstRun === true || looptime === true) {
                                            _this._animationplaying = true;
                                            animationTrack.targetedAnimations.forEach(function (targetedAnim) {
                                                if (targetedAnim.target instanceof BABYLON.TransformNode) {
                                                    var clipTarget = targetedAnim.target;
                                                    if (layer.index === 0 || layer.avatarMask == null || _this.filterTargetAvatarMask(layer, clipTarget)) {
                                                        var targetRootBone = (clipTarget.metadata != null && clipTarget.metadata.unity != null && clipTarget.metadata.unity.rootbone != null) ? clipTarget.metadata.unity.rootbone : false;
                                                        if (targetRootBone === true) {
                                                            if (_this._initialRootBonePosition == null) {
                                                                var targetRootPos = (clipTarget.metadata != null && clipTarget.metadata.unity != null && clipTarget.metadata.unity.rootpos != null) ? clipTarget.metadata.unity.rootpos : null;
                                                                if (targetRootPos != null)
                                                                    _this._initialRootBonePosition = BABYLON.Vector3.FromArray(targetRootPos);
                                                                if (_this._initialRootBonePosition == null)
                                                                    _this._initialRootBonePosition = new BABYLON.Vector3(0, 0, 0);
                                                                // console.warn("A - Init Root Bone Position: " + clipTarget.name);
                                                                // console.log(this._initialRootBonePosition);
                                                            }
                                                            if (_this._initialRootBoneRotation == null) {
                                                                var targetRootRot = (clipTarget.metadata != null && clipTarget.metadata.unity != null && clipTarget.metadata.unity.rootrot != null) ? clipTarget.metadata.unity.rootrot : null;
                                                                if (targetRootRot != null) {
                                                                    var quat = BABYLON.Quaternion.FromArray(targetRootRot);
                                                                    _this._initialRootBoneRotation = quat.toEulerAngles();
                                                                }
                                                                if (_this._initialRootBoneRotation == null)
                                                                    _this._initialRootBoneRotation = new BABYLON.Vector3(0, 0, 0);
                                                                // console.warn("A - Init Root Bone Rotation: " + clipTarget.name);
                                                                // console.log(this._initialRootBoneRotation);
                                                            }
                                                        }
                                                        if (clipTarget.metadata != null && clipTarget.metadata.mixer != null) {
                                                            var clipTargetMixer = clipTarget.metadata.mixer[layer.index];
                                                            if (clipTargetMixer != null) {
                                                                if (targetedAnim.animation.targetProperty === "position") {
                                                                    _this._targetPosition = BABYLON.Utilities.SampleAnimationVector3(targetedAnim.animation, animationFrameTime_1);
                                                                    // ..
                                                                    // Handle Root Motion (Position)
                                                                    // ..
                                                                    if (targetRootBone === true && _this._initialRootBonePosition != null) {
                                                                        _this._positionWeight = true;
                                                                        _this._positionHolder.copyFrom(_this._initialRootBonePosition);
                                                                        _this._rootBoneWeight = false;
                                                                        _this._rootBoneHolder.set(0, 0, 0);
                                                                        // ..
                                                                        // Apply Root Motion
                                                                        // ..
                                                                        if (_this.applyRootMotion === true) {
                                                                            if (loopblendpositiony_1 === true && loopblendpositionxz_1 === true) {
                                                                                _this._positionWeight = true; // Bake XYZ Into Pose
                                                                                _this._positionHolder.set(_this._targetPosition.x, (_this._targetPosition.y + level_1), _this._targetPosition.z);
                                                                            }
                                                                            else if (loopblendpositiony_1 === false && loopblendpositionxz_1 === false) {
                                                                                _this._rootBoneWeight = true; // Use XYZ As Root Motion
                                                                                _this._rootBoneHolder.set(_this._targetPosition.x, (_this._targetPosition.y + level_1), _this._targetPosition.z);
                                                                            }
                                                                            else if (loopblendpositiony_1 === true && loopblendpositionxz_1 === false) {
                                                                                _this._positionWeight = true; // Bake Y Into Pose 
                                                                                _this._positionHolder.set(_this._initialRootBonePosition.x, (_this._targetPosition.y + level_1), _this._initialRootBonePosition.z);
                                                                                _this._rootBoneWeight = true; // Use XZ As Root Motion
                                                                                _this._rootBoneHolder.set(_this._targetPosition.x, 0, _this._targetPosition.z); // MAYBE: Use this.transform.position.y - ???
                                                                            }
                                                                            else if (loopblendpositionxz_1 === true && loopblendpositiony_1 === false) {
                                                                                _this._positionWeight = true; // Bake XZ Into Pose
                                                                                _this._positionHolder.set(_this._targetPosition.x, _this._initialRootBonePosition.y, _this._targetPosition.z);
                                                                                _this._rootBoneWeight = true; // Use Y As Root Motion
                                                                                _this._rootBoneHolder.set(0, (_this._targetPosition.y + level_1), 0); // MAYBE: Use this.transform.position.xz - ???
                                                                            }
                                                                        }
                                                                        else {
                                                                            _this._positionWeight = true; // Bake XYZ Original Motion
                                                                            _this._positionHolder.set(_this._targetPosition.x, (_this._targetPosition.y + level_1), _this._targetPosition.z);
                                                                        }
                                                                        // Bake Position Holder
                                                                        if (_this._positionWeight === true) {
                                                                            if (clipTargetMixer.positionBuffer == null)
                                                                                clipTargetMixer.positionBuffer = new BABYLON.Vector3(0, 0, 0);
                                                                            BABYLON.Utilities.BlendVector3Value(clipTargetMixer.positionBuffer, _this._positionHolder, 1.0);
                                                                        }
                                                                        // Bake Root Bone Holder
                                                                        if (_this._rootBoneWeight === true) {
                                                                            if (clipTargetMixer.rootPosition == null)
                                                                                clipTargetMixer.rootPosition = new BABYLON.Vector3(0, 0, 0);
                                                                            BABYLON.Utilities.BlendVector3Value(clipTargetMixer.rootPosition, _this._rootBoneHolder, 1.0);
                                                                        }
                                                                    }
                                                                    else {
                                                                        // Bake Normal Pose Position
                                                                        if (clipTargetMixer.positionBuffer == null)
                                                                            clipTargetMixer.positionBuffer = new BABYLON.Vector3(0, 0, 0);
                                                                        BABYLON.Utilities.BlendVector3Value(clipTargetMixer.positionBuffer, _this._targetPosition, 1.0);
                                                                    }
                                                                }
                                                                else if (targetedAnim.animation.targetProperty === "rotationQuaternion") {
                                                                    _this._targetRotation = BABYLON.Utilities.SampleAnimationQuaternion(targetedAnim.animation, animationFrameTime_1);
                                                                    // ..
                                                                    // Handle Root Motion (Rotation)
                                                                    // ..
                                                                    if (targetRootBone === true) {
                                                                        _this._rotationWeight = false;
                                                                        _this._rotationHolder.set(0, 0, 0, 0);
                                                                        _this._rootQuatWeight = false;
                                                                        _this._rootQuatHolder.set(0, 0, 0, 0);
                                                                        // TODO - OPTIMIZE TO EULER ANGLES
                                                                        var eulerAngle = _this._targetRotation.toEulerAngles();
                                                                        var orientationAngleY = eulerAngle.y; //(keeporiginalorientation === true) ? eulerAngle.y : this._bodyOrientationAngleY;
                                                                        // ..
                                                                        // Apply Root Motion
                                                                        // ..
                                                                        if (_this.applyRootMotion === true) {
                                                                            if (loopblendorientation_1 === true) {
                                                                                _this._rotationWeight = true; // Bake XYZ Into Pose
                                                                                BABYLON.Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety_1), eulerAngle.z, _this._rotationHolder);
                                                                            }
                                                                            else {
                                                                                _this._rotationWeight = true; // Bake XZ Into Pose
                                                                                BABYLON.Quaternion.FromEulerAnglesToRef(eulerAngle.x, _this._initialRootBoneRotation.y, eulerAngle.z, _this._rotationHolder);
                                                                                _this._rootQuatWeight = true; // Use Y As Root Motion
                                                                                BABYLON.Quaternion.FromEulerAnglesToRef(0, (orientationAngleY + orientationoffsety_1), 0, _this._rootQuatHolder); // MAYBE: Use this.transform.rotation.xz - ???
                                                                            }
                                                                        }
                                                                        else {
                                                                            _this._rotationWeight = true; // Bake XYZ Into Pose
                                                                            BABYLON.Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety_1), eulerAngle.z, _this._rotationHolder);
                                                                        }
                                                                        // Bake Rotation Holder
                                                                        if (_this._rotationWeight === true) {
                                                                            if (clipTargetMixer.rotationBuffer == null)
                                                                                clipTargetMixer.rotationBuffer = new BABYLON.Quaternion(0, 0, 0, 1);
                                                                            BABYLON.Utilities.BlendQuaternionValue(clipTargetMixer.rotationBuffer, _this._rotationHolder, 1.0);
                                                                        }
                                                                        // Bake Root Bone Rotation
                                                                        if (_this._rootQuatWeight === true) {
                                                                            if (clipTargetMixer.rootRotation == null)
                                                                                clipTargetMixer.rootRotation = new BABYLON.Quaternion(0, 0, 0, 1);
                                                                            BABYLON.Utilities.BlendQuaternionValue(clipTargetMixer.rootRotation, _this._rootQuatHolder, 1.0);
                                                                        }
                                                                    }
                                                                    else {
                                                                        // Bake Normal Pose Rotation
                                                                        if (clipTargetMixer.rotationBuffer == null)
                                                                            clipTargetMixer.rotationBuffer = new BABYLON.Quaternion(0, 0, 0, 1);
                                                                        BABYLON.Utilities.BlendQuaternionValue(clipTargetMixer.rotationBuffer, _this._targetRotation, 1.0);
                                                                    }
                                                                }
                                                                else if (targetedAnim.animation.targetProperty === "scaling") {
                                                                    _this._targetScaling = BABYLON.Utilities.SampleAnimationVector3(targetedAnim.animation, animationFrameTime_1);
                                                                    if (clipTargetMixer.scalingBuffer == null)
                                                                        clipTargetMixer.scalingBuffer = new BABYLON.Vector3(1, 1, 1);
                                                                    BABYLON.Utilities.BlendVector3Value(clipTargetMixer.scalingBuffer, _this._targetScaling, 1.0);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else if (targetedAnim.target instanceof BABYLON.MorphTarget) {
                                                    var morphTarget = targetedAnim.target;
                                                    if (morphTarget.metadata != null && morphTarget.metadata.mixer != null) {
                                                        var morphTargetMixer = morphTarget.metadata.mixer[layer.index];
                                                        if (targetedAnim.animation.targetProperty === "influence") {
                                                            var floatValue = BABYLON.Utilities.SampleAnimationFloat(targetedAnim.animation, animationFrameTime_1);
                                                            if (morphTargetMixer.influenceBuffer == null)
                                                                morphTargetMixer.influenceBuffer = 0;
                                                            morphTargetMixer.influenceBuffer = BABYLON.Utilities.BlendFloatValue(morphTargetMixer.influenceBuffer, floatValue, 1.0);
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // Parse Layer Animation Curves
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        if (layer.animationStateMachine.tcurves != null && layer.animationStateMachine.tcurves.length > 0) {
                                            layer.animationStateMachine.tcurves.forEach(function (animation) {
                                                if (animation.targetProperty != null && animation.targetProperty !== "") {
                                                    var sample = BABYLON.Utilities.SampleAnimationFloat(animation, layer.animationNormal);
                                                    _this.setFloat(animation.targetProperty, sample);
                                                }
                                            });
                                        }
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // Validate Layer Animation Events (TODO - Pass Layer Index Properties To Observers)
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        if (layer.animationStateMachine.events != null && layer.animationStateMachine.events.length > 0) {
                                            layer.animationStateMachine.events.forEach(function (animatorEvent) {
                                                if (animatorEvent.time === formattedTime_1) {
                                                    var animEventKey = animatorEvent.function + "_" + animatorEvent.time;
                                                    if (layer.animationLoopEvents == null)
                                                        layer.animationLoopEvents = {};
                                                    if (!layer.animationLoopEvents[animEventKey]) {
                                                        layer.animationLoopEvents[animEventKey] = true;
                                                        // console.log("Blend Tree Animation Event: " + animatorEvent.time + " >> " + animatorEvent.clip + " >> " + animatorEvent.function);
                                                        if (_this.onAnimationEventObservable.hasObservers() === true) {
                                                            _this.onAnimationEventObservable.notifyObservers(animatorEvent);
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        // Step Motion Clip Animation Time
                                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        if (layer.animationLoopFrame === true) {
                                            layer.animationTime = 0;
                                            layer.animationNormal = 0;
                                            layer.animationLoopFrame = false;
                                            layer.animationLoopEvents = null;
                                        }
                                    }
                                    else {
                                        // console.warn(">>> No Motion Clip Animation Track Found For: " + this.transform.name);
                                    }
                                }
                                else {
                                    _this._animationplaying = true; // Note: Blend Tree Are Always Playing
                                    // this._blendMessage = "";
                                    _this._blendWeights.primary = null;
                                    _this._blendWeights.secondary = null;
                                    var scaledWeightList = [];
                                    var primaryBlendTree_1 = layerState.blendtree;
                                    _this.parseTreeBranches(layer, primaryBlendTree_1, 1.0, scaledWeightList);
                                    var frameRatio = _this.computeWeightedFrameRatio(scaledWeightList);
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    // Blend Tree Animation Delta Time
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    layer.animationTime += (deltaTime * frameRatio * Math.abs(layerState.speed) * Math.abs(_this.speedRatio) * BABYLON.AnimationState.SPEED);
                                    if (layer.animationTime > BABYLON.AnimationState.TIME)
                                        layer.animationTime = BABYLON.AnimationState.TIME;
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    // Blend Tree Animation Normalized Time
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    layer.animationNormal = (layer.animationTime / BABYLON.AnimationState.TIME); // Note: Normalize Layer Frame Time
                                    var validateTime = (layer.animationNormal > 0.99) ? 1 : layer.animationNormal;
                                    var formattedTime_2 = Math.round(validateTime * 100) / 100;
                                    if (layerState.speed < 0)
                                        layer.animationNormal = (1 - layer.animationNormal); // Note: Reverse Normalized Frame Time
                                    var blendingNormalTime = layer.animationNormal; // Note: Denormalize Animation Frame Time
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    if (layer.animationTime >= BABYLON.AnimationState.TIME) {
                                        layer.animationFirstRun = false;
                                        layer.animationLoopFrame = true; // Note: No Loop Or End Events For Blend Trees - ???
                                        layer.animationLoopCount++;
                                    }
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    var masterAnimationTrack = (scaledWeightList != null && scaledWeightList.length > 0 && scaledWeightList[0].track != null) ? scaledWeightList[0].track : null;
                                    if (masterAnimationTrack != null) {
                                        var targetCount = masterAnimationTrack.targetedAnimations.length;
                                        for (var targetIndex = 0; targetIndex < targetCount; targetIndex++) {
                                            var masterAnimimation = masterAnimationTrack.targetedAnimations[targetIndex];
                                            if (masterAnimimation.target instanceof BABYLON.TransformNode) {
                                                var blendTarget = masterAnimimation.target;
                                                if (layer.index === 0 || layer.avatarMask == null || _this.filterTargetAvatarMask(layer, blendTarget)) {
                                                    var targetRootBone = (blendTarget.metadata != null && blendTarget.metadata.unity != null && blendTarget.metadata.unity.rootbone != null) ? blendTarget.metadata.unity.rootbone : false;
                                                    if (targetRootBone === true) {
                                                        if (_this._initialRootBonePosition == null) {
                                                            var targetRootPos = (blendTarget.metadata != null && blendTarget.metadata.unity != null && blendTarget.metadata.unity.rootpos != null) ? blendTarget.metadata.unity.rootpos : null;
                                                            if (targetRootPos != null)
                                                                _this._initialRootBonePosition = BABYLON.Vector3.FromArray(targetRootPos);
                                                            if (_this._initialRootBonePosition == null)
                                                                _this._initialRootBonePosition = new BABYLON.Vector3(0, 0, 0);
                                                            // console.warn("B - Init Root Bone Position: " + blendTarget.name);
                                                            // console.log(this._initialRootBonePosition);
                                                        }
                                                        if (_this._initialRootBoneRotation == null) {
                                                            var targetRootRot = (blendTarget.metadata != null && blendTarget.metadata.unity != null && blendTarget.metadata.unity.rootrot != null) ? blendTarget.metadata.unity.rootrot : null;
                                                            if (targetRootRot != null) {
                                                                var quat = BABYLON.Quaternion.FromArray(targetRootRot);
                                                                _this._initialRootBoneRotation = quat.toEulerAngles();
                                                            }
                                                            if (_this._initialRootBoneRotation == null)
                                                                _this._initialRootBoneRotation = new BABYLON.Vector3(0, 0, 0);
                                                            // console.warn("B - Init Root Bone Rotation: " + blendTarget.name);
                                                            // console.log(this._initialRootBoneRotation);
                                                        }
                                                    }
                                                    if (blendTarget.metadata != null && blendTarget.metadata.mixer != null) {
                                                        _this._initialtargetblending = true; // Note: Reset First Target Blending Buffer
                                                        var blendTargetMixer = blendTarget.metadata.mixer[layer.index];
                                                        _this.updateBlendableTargets(deltaTime, layer, primaryBlendTree_1, masterAnimimation, targetIndex, blendTargetMixer, blendingNormalTime, targetRootBone, blendTarget);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        // console.warn(">>> No Blend Tree Master Animation Track Found For: " + this.transform.name);
                                    }
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    // Parse Layer Animation Curves
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    if (layer.animationStateMachine.tcurves != null && layer.animationStateMachine.tcurves.length > 0) {
                                        layer.animationStateMachine.tcurves.forEach(function (animation) {
                                            if (animation.targetProperty != null && animation.targetProperty !== "") {
                                                var sample = BABYLON.Utilities.SampleAnimationFloat(animation, layer.animationNormal);
                                                _this.setFloat(animation.targetProperty, sample);
                                            }
                                        });
                                    }
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    // Validate Layer Animation Events (TODO - Pass Layer Index And Clip Blended Weight Properties To Observers)
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    if (layer.animationStateMachine.events != null && layer.animationStateMachine.events.length > 0) {
                                        layer.animationStateMachine.events.forEach(function (animatorEvent) {
                                            if (animatorEvent.time === formattedTime_2) {
                                                var animEventKey = animatorEvent.function + "_" + animatorEvent.time;
                                                if (layer.animationLoopEvents == null)
                                                    layer.animationLoopEvents = {};
                                                if (!layer.animationLoopEvents[animEventKey]) {
                                                    layer.animationLoopEvents[animEventKey] = true;
                                                    // console.log("Blend Tree Animation Event: " + animatorEvent.time + " >> " + animatorEvent.clip + " >> " + animatorEvent.function);
                                                    if (_this.onAnimationEventObservable.hasObservers() === true) {
                                                        _this.onAnimationEventObservable.notifyObservers(animatorEvent);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    // Step Blend Tree Animation Time
                                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    if (layer.animationLoopFrame === true) {
                                        layer.animationTime = 0;
                                        layer.animationNormal = 0;
                                        layer.animationLoopFrame = false;
                                        layer.animationLoopEvents = null;
                                    }
                                }
                            }
                        }
                    }
                });
            }
            this.finalizeAnimationTargets();
        };
        // private _blendMessage:string = "";
        AnimationState.prototype.updateBlendableTargets = function (deltaTime, layer, tree, masterAnimation, targetIndex, targetMixer, normalizedFrameTime, targetRootBone, blendTarget) {
            if (targetMixer != null && tree.children != null && tree.children.length > 0) {
                for (var index = 0; index < tree.children.length; index++) {
                    var child = tree.children[index];
                    if (child.weight > 0) {
                        if (child.type === BABYLON.MotionType.Clip) {
                            if (child.track != null) {
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                // let additivereferenceposeclip:number = 0;
                                // let additivereferenceposetime:number = 0.0;
                                // let hasadditivereferencepose:boolean = false;
                                // let starttime:number = 0.0;
                                // let stoptime:number = 0.0;
                                // let mirror:boolean = false;
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                // let looptime:boolean = true;
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                var level = 0.0;
                                var xspeed = 0.0;
                                var zspeed = 0.0;
                                //let loopblend:boolean = false;
                                //let cycleoffset:number = 0.0;
                                //let heightfromfeet:boolean = false;
                                var orientationoffsety = 0.0;
                                //let keeporiginalorientation:boolean = true;
                                //let keeporiginalpositiony:boolean = true;
                                //let keeporiginalpositionxz:boolean = true;
                                var loopblendorientation = true;
                                var loopblendpositiony = true;
                                var loopblendpositionxz = true;
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                var agroup = child.track;
                                if (agroup.metadata != null && agroup.metadata.unity != null) {
                                    if (agroup.metadata.unity.averagespeed != null) {
                                        xspeed = (agroup.metadata.unity.averagespeed.x != null) ? agroup.metadata.unity.averagespeed.x : 0;
                                        zspeed = (agroup.metadata.unity.averagespeed.z != null) ? agroup.metadata.unity.averagespeed.z : 0;
                                    }
                                    if (agroup.metadata.unity.settings != null) {
                                        level = (agroup.metadata.unity.settings.level != null) ? agroup.metadata.unity.settings.level : 0;
                                        // DEPRECIATED: loopblend = (agroup.metadata.unity.settings.loopblend != null) ? agroup.metadata.unity.settings.loopblend : false;
                                        // DEPRECIATED: cycleoffset = (agroup.metadata.unity.settings.cycleoffset != null) ? agroup.metadata.unity.settings.cycleoffset : 0;
                                        // DEPRECIATED: heightfromfeet = (agroup.metadata.unity.settings.heightfromfeet != null) ? agroup.metadata.unity.settings.heightfromfeet : false;
                                        orientationoffsety = (agroup.metadata.unity.settings.orientationoffsety != null) ? agroup.metadata.unity.settings.orientationoffsety : 0;
                                        // DEPRECIATED: keeporiginalorientation = (agroup.metadata.unity.settings.keeporiginalorientation != null) ? agroup.metadata.unity.settings.keeporiginalorientation : true;
                                        // DEPRECIATED: keeporiginalpositiony = (agroup.metadata.unity.settings.keeporiginalpositiony != null) ? agroup.metadata.unity.settings.keeporiginalpositiony : true;
                                        // DEPRECIATED: keeporiginalpositionxz = (agroup.metadata.unity.settings.keeporiginalpositionxz != null) ? agroup.metadata.unity.settings.keeporiginalpositionxz : true;
                                        loopblendorientation = (agroup.metadata.unity.settings.loopblendorientation != null) ? agroup.metadata.unity.settings.loopblendorientation : true;
                                        loopblendpositiony = (agroup.metadata.unity.settings.loopblendpositiony != null) ? agroup.metadata.unity.settings.loopblendpositiony : true;
                                        loopblendpositionxz = (agroup.metadata.unity.settings.loopblendpositionxz != null) ? agroup.metadata.unity.settings.loopblendpositionxz : true;
                                    }
                                }
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                // Unity Inverts Root Motion Animation Offsets
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                orientationoffsety = BABYLON.Tools.ToRadians(orientationoffsety);
                                // DEPRECIATED: orientationoffsety *= -1;
                                xspeed = Math.abs(xspeed);
                                zspeed = Math.abs(zspeed);
                                level *= -1;
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                // this._blendMessage += (" >>> " + child.motion + ": " + child.weight.toFixed(2));
                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                // TODO - Get blendable animation from target map - ???
                                var blendableAnim = child.track.targetedAnimations[targetIndex];
                                var blendableWeight = (this._initialtargetblending === true) ? 1.0 : parseFloat(child.weight.toFixed(2));
                                this._initialtargetblending = false; // Note: Clear First Target Blending Buffer
                                if (blendableAnim.target === masterAnimation.target && blendableAnim.animation.targetProperty === masterAnimation.animation.targetProperty) {
                                    var adjustedFrameTime = normalizedFrameTime; // Note: Adjust Normalized Frame Time
                                    if (child.timescale < 0)
                                        adjustedFrameTime = (1 - adjustedFrameTime); // Note: Reverse Normalized Frame Time
                                    var animationFrameTime = (child.track.to * adjustedFrameTime); // Note: Denormalize Animation Frame Time
                                    //const animationFrameTime:number = (Math.round((child.track.to * adjustedFrameTime) * 100) / 100);  // Note: Denormalize Animation Frame Time
                                    if (masterAnimation.animation.targetProperty === "position") {
                                        this._targetPosition = BABYLON.Utilities.SampleAnimationVector3(blendableAnim.animation, animationFrameTime);
                                        // ..
                                        // Root Transform Position
                                        // ..
                                        if (targetRootBone === true && this._initialRootBonePosition != null) {
                                            this._positionWeight = true;
                                            this._positionHolder.copyFrom(this._initialRootBonePosition);
                                            this._rootBoneWeight = false;
                                            this._rootBoneHolder.set(0, 0, 0);
                                            // ..
                                            // Apply Root Motion
                                            // ..
                                            if (this.applyRootMotion === true) {
                                                if (loopblendpositiony === true && loopblendpositionxz === true) {
                                                    this._positionWeight = true; // Bake XYZ Into Pose
                                                    this._positionHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                                }
                                                else if (loopblendpositiony === false && loopblendpositionxz === false) {
                                                    this._rootBoneWeight = true; // Use XYZ As Root Motion
                                                    this._rootBoneHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                                }
                                                else if (loopblendpositiony === true && loopblendpositionxz === false) {
                                                    this._positionWeight = true; // Bake Y Into Pose 
                                                    this._positionHolder.set(this._initialRootBonePosition.x, (this._targetPosition.y + level), this._initialRootBonePosition.z);
                                                    this._rootBoneWeight = true; // Use XZ As Root Motion
                                                    this._rootBoneHolder.set(this._targetPosition.x, 0, this._targetPosition.z); // MAYBE: Use this.transform.position.y - ???
                                                }
                                                else if (loopblendpositionxz === true && loopblendpositiony === false) {
                                                    this._positionWeight = true; // Bake XZ Into Pose
                                                    this._positionHolder.set(this._targetPosition.x, this._initialRootBonePosition.y, this._targetPosition.z);
                                                    this._rootBoneWeight = true; // Use Y As Root Motion
                                                    this._rootBoneHolder.set(0, (this._targetPosition.y + level), 0); // MAYBE: Use this.transform.position.xz - ???
                                                }
                                            }
                                            else {
                                                this._positionWeight = true; // Bake XYZ Original Motion
                                                this._positionHolder.set(this._targetPosition.x, (this._targetPosition.y + level), this._targetPosition.z);
                                            }
                                            // Bake Position Holder
                                            if (this._positionWeight === true) {
                                                if (targetMixer.positionBuffer == null)
                                                    targetMixer.positionBuffer = new BABYLON.Vector3(0, 0, 0);
                                                BABYLON.Utilities.BlendVector3Value(targetMixer.positionBuffer, this._positionHolder, blendableWeight);
                                            }
                                            // Bake Root Bone Holder
                                            if (this._rootBoneWeight === true) {
                                                if (targetMixer.rootPosition == null)
                                                    targetMixer.rootPosition = new BABYLON.Vector3(0, 0, 0);
                                                BABYLON.Utilities.BlendVector3Value(targetMixer.rootPosition, this._rootBoneHolder, blendableWeight);
                                            }
                                        }
                                        else {
                                            // Bake Normal Pose Position
                                            if (targetMixer.positionBuffer == null)
                                                targetMixer.positionBuffer = new BABYLON.Vector3(0, 0, 0);
                                            BABYLON.Utilities.BlendVector3Value(targetMixer.positionBuffer, this._targetPosition, blendableWeight);
                                        }
                                    }
                                    else if (masterAnimation.animation.targetProperty === "rotationQuaternion") {
                                        this._targetRotation = BABYLON.Utilities.SampleAnimationQuaternion(blendableAnim.animation, animationFrameTime);
                                        // ..
                                        // Root Transform Rotation
                                        // ..
                                        if (targetRootBone === true) {
                                            this._rotationWeight = false;
                                            this._rotationHolder.set(0, 0, 0, 0);
                                            this._rootQuatWeight = false;
                                            this._rootQuatHolder.set(0, 0, 0, 0);
                                            var eulerAngle = this._targetRotation.toEulerAngles();
                                            var orientationAngleY = eulerAngle.y; //(keeporiginalorientation === true) ? eulerAngle.y : this._bodyOrientationAngleY;
                                            // ..
                                            // Apply Root Motion
                                            // ..
                                            if (this.applyRootMotion === true) {
                                                if (loopblendorientation === true) {
                                                    this._rotationWeight = true; // Bake XYZ Into Pose
                                                    BABYLON.Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety), eulerAngle.z, this._rotationHolder);
                                                }
                                                else {
                                                    this._rotationWeight = true; // Bake XZ Into Pose
                                                    BABYLON.Quaternion.FromEulerAnglesToRef(eulerAngle.x, this._initialRootBoneRotation.y, eulerAngle.z, this._rotationHolder);
                                                    this._rootQuatWeight = true; // Use Y As Root Motion
                                                    BABYLON.Quaternion.FromEulerAnglesToRef(0, (orientationAngleY + orientationoffsety), 0, this._rootQuatHolder); // MAYBE: Use this.transform.rotation.xz - ???
                                                }
                                            }
                                            else {
                                                this._rotationWeight = true; // Bake XYZ Into Pose
                                                BABYLON.Quaternion.FromEulerAnglesToRef(eulerAngle.x, (orientationAngleY + orientationoffsety), eulerAngle.z, this._rotationHolder);
                                            }
                                            // Bake Rotation Holder
                                            if (this._rotationWeight === true) {
                                                if (targetMixer.rotationBuffer == null)
                                                    targetMixer.rotationBuffer = new BABYLON.Quaternion(0, 0, 0, 1);
                                                BABYLON.Utilities.BlendQuaternionValue(targetMixer.rotationBuffer, this._rotationHolder, blendableWeight);
                                            }
                                            // Bake Root Bone Rotation
                                            if (this._rootQuatWeight === true) {
                                                if (targetMixer.rootRotation == null)
                                                    targetMixer.rootRotation = new BABYLON.Quaternion(0, 0, 0, 1);
                                                BABYLON.Utilities.BlendQuaternionValue(targetMixer.rootRotation, this._rootQuatHolder, blendableWeight);
                                            }
                                        }
                                        else {
                                            // Bake Normal Pose Rotation
                                            if (targetMixer.rotationBuffer == null)
                                                targetMixer.rotationBuffer = new BABYLON.Quaternion(0, 0, 0, 1);
                                            BABYLON.Utilities.BlendQuaternionValue(targetMixer.rotationBuffer, this._targetRotation, blendableWeight);
                                        }
                                    }
                                    else if (masterAnimation.animation.targetProperty === "scaling") {
                                        this._targetScaling = BABYLON.Utilities.SampleAnimationVector3(blendableAnim.animation, animationFrameTime);
                                        if (targetMixer.scalingBuffer == null)
                                            targetMixer.scalingBuffer = new BABYLON.Vector3(1, 1, 1);
                                        BABYLON.Utilities.BlendVector3Value(targetMixer.scalingBuffer, this._targetScaling, blendableWeight);
                                    }
                                }
                                else {
                                    BABYLON.Tools.Warn(tree.name + " - " + child.track.name + " blend tree mismatch (" + targetIndex + "): " + masterAnimation.target.name + " >>> " + blendableAnim.target.name);
                                }
                            }
                        }
                        else if (child.type === BABYLON.MotionType.Tree) {
                            this.updateBlendableTargets(deltaTime, layer, child.subtree, masterAnimation, targetIndex, targetMixer, normalizedFrameTime, targetRootBone, blendTarget);
                        }
                    }
                }
            }
            //if (targetIndex === 0) BABYLON.Utilities.PrintToScreen(this._blendMessage, "red");
        };
        AnimationState.prototype.finalizeAnimationTargets = function () {
            var _this = this;
            this._deltaPosition.set(0, 0, 0);
            this._deltaRotation.set(0, 0, 0, 1);
            this._deltaPositionFixed.set(0, 0, 0);
            this._dirtyMotionMatrix = null;
            if (this.m_animationTargets != null && this.m_animationTargets.length > 0) {
                this.m_animationTargets.forEach(function (targetedAnim) {
                    var animationTarget = targetedAnim.target;
                    // ..
                    // Update Direct Transform Targets For Each Layer
                    // ..
                    if (animationTarget.metadata != null && animationTarget.metadata.mixer != null) {
                        if (_this._machine.layers != null && _this._machine.layers.length > 0) {
                            _this._blenderMatrix.reset();
                            _this._dirtyBlenderMatrix = null;
                            _this._machine.layers.forEach(function (layer) {
                                var animationTargetMixer = animationTarget.metadata.mixer[layer.index];
                                if (animationTargetMixer != null) {
                                    if (animationTarget instanceof BABYLON.TransformNode) {
                                        // ..
                                        // Update Dirty Transform Matrix
                                        // ..
                                        if (animationTargetMixer.positionBuffer != null || animationTargetMixer.rotationBuffer != null || animationTargetMixer.scalingBuffer != null) {
                                            BABYLON.Matrix.ComposeToRef((animationTargetMixer.scalingBuffer || animationTarget.scaling), (animationTargetMixer.rotationBuffer || animationTarget.rotationQuaternion), (animationTargetMixer.positionBuffer || animationTarget.position), _this._updateMatrix);
                                            if (animationTargetMixer.blendingSpeed > 0.0) {
                                                if (animationTargetMixer.blendingFactor <= 1.0 && animationTargetMixer.originalMatrix == null) {
                                                    animationTargetMixer.originalMatrix = BABYLON.Matrix.Compose((animationTarget.scaling), (animationTarget.rotationQuaternion), (animationTarget.position));
                                                }
                                                if (animationTargetMixer.blendingFactor <= 1.0 && animationTargetMixer.originalMatrix != null) {
                                                    BABYLON.Utilities.FastMatrixSlerp(animationTargetMixer.originalMatrix, _this._updateMatrix, animationTargetMixer.blendingFactor, _this._updateMatrix);
                                                    animationTargetMixer.blendingFactor += animationTargetMixer.blendingSpeed;
                                                }
                                            }
                                            BABYLON.Utilities.FastMatrixSlerp(_this._blenderMatrix, _this._updateMatrix, layer.defaultWeight, _this._blenderMatrix);
                                            _this._dirtyBlenderMatrix = true;
                                            animationTargetMixer.positionBuffer = null;
                                            animationTargetMixer.rotationBuffer = null;
                                            animationTargetMixer.scalingBuffer = null;
                                        }
                                        // ..
                                        // Update Dirty Root Motion Matrix
                                        // ..
                                        if (animationTargetMixer.rootPosition != null || animationTargetMixer.rootRotation != null) {
                                            BABYLON.Matrix.ComposeToRef((_this._emptyScaling), (animationTargetMixer.rootRotation || _this._emptyRotation), (animationTargetMixer.rootPosition || _this._emptyPosition), _this._updateMatrix);
                                            // ..
                                            // TODO - May Need Seperate Blending Speed Properties
                                            // Note: Might Fix Large Root Motion Delta Issue - ???
                                            // ..
                                            /*
                                            if (animationTargetMixer.blendingSpeed > 0.0) {
                                                if (animationTargetMixer.blendingFactor <= 1.0 && animationTargetMixer.originalMatrix == null) {
                                                    animationTargetMixer.originalMatrix = BABYLON.Matrix.Compose(
                                                        (this.transform.scaling),
                                                        (this.transform.rotationQuaternion),
                                                        (this.transform.position)
                                                    );
                                                }
                                                if (animationTargetMixer.blendingFactor <= 1.0 && animationTargetMixer.originalMatrix != null) {
                                                    BABYLON.Utilities.FastMatrixSlerp(animationTargetMixer.originalMatrix, this._updateMatrix, animationTargetMixer.blendingFactor, this._updateMatrix);
                                                    animationTargetMixer.blendingFactor += animationTargetMixer.blendingSpeed;
                                                }
                                            }
                                            */
                                            BABYLON.Utilities.FastMatrixSlerp(_this._rootMotionMatrix, _this._updateMatrix, layer.defaultWeight, _this._rootMotionMatrix);
                                            _this._dirtyMotionMatrix = true;
                                            animationTargetMixer.rootPosition = null;
                                            animationTargetMixer.rootRotation = null;
                                        }
                                    }
                                    else if (animationTarget instanceof BABYLON.MorphTarget) {
                                        if (animationTargetMixer.influenceBuffer != null) {
                                            animationTarget.influence = BABYLON.Scalar.Lerp(animationTarget.influence, animationTargetMixer.influenceBuffer, layer.defaultWeight);
                                            animationTargetMixer.influenceBuffer = null;
                                        }
                                    }
                                }
                            });
                            if (_this._dirtyBlenderMatrix != null) {
                                _this._blenderMatrix.decompose(animationTarget.scaling, animationTarget.rotationQuaternion, animationTarget.position);
                            }
                        }
                    }
                });
            }
            // ..
            if (this.applyRootMotion === true) {
                if (this._dirtyMotionMatrix != null) {
                    this._rootMotionMatrix.decompose(this._rootMotionScaling, this._rootMotionRotation, this._rootMotionPosition);
                    if (this._frametime === 0) {
                        this._lastMotionPosition.copyFrom(this._rootMotionPosition);
                        this._lastMotionRotation.copyFrom(this._rootMotionRotation);
                    }
                    // ..
                    // Update Current Delta Position
                    // ..
                    this._rootMotionPosition.subtractToRef(this._lastMotionPosition, this._deltaPosition);
                    // ..
                    // Update Current Delta Rotation
                    // ..
                    BABYLON.Utilities.QuaternionDiffToRef(this._rootMotionRotation, this._lastMotionRotation, this._deltaRotation);
                    this._deltaRotation.toEulerAnglesToRef(this._angularVelocity);
                    // ..
                    // Update Last Root Motion Deltas
                    // ..
                    this._saveDeltaPosition.copyFrom(this._deltaPosition);
                    this._saveDeltaRotation.copyFrom(this._deltaRotation);
                    this._lastMotionPosition.addInPlace(this._deltaPosition);
                    this._lastMotionRotation.multiplyInPlace(this._deltaRotation);
                    // ..
                    // Update Root Motion Transformation
                    // ..
                    this.transform.rotationQuaternion.toRotationMatrix(this._deltaPositionMatrix); // TODO: Optimize Rotation Matrix Is Dirty - ???
                    BABYLON.Vector3.TransformCoordinatesToRef(this._deltaPosition, this._deltaPositionMatrix, this._deltaPositionFixed);
                }
                // ..
                // Update Transform Delta Rotation
                // ..
                if (this.updateRootMotionRotation === true) {
                    this.transform.addRotation(0, this._angularVelocity.y, 0); // Note: Always Rotate The Transform Node
                }
                // ..
                // Update Transform Delta Position
                // ..
                if (this.updateRootMotionPosition === true) {
                    if (this._updatemode === 1 && this.m_characterController != null) {
                        // TODO: Use Character Controller To Move Entity - ???
                    }
                    else {
                        if (this.m_characterController != null) {
                            // TODO: Set Character Controller Update Position And Sync With Transform (If Exists)
                        }
                        this.transform.position.addInPlace(this._deltaPositionFixed);
                    }
                }
            }
        };
        AnimationState.prototype.checkStateMachine = function (layer, deltaTime) {
            var _this = this;
            this._checkers.result = null;
            this._checkers.offest = 0;
            this._checkers.blending = 0;
            this._checkers.triggered = [];
            // ..
            // Check Animation State Transitions
            // ..
            if (layer.animationStateMachine != null) {
                layer.animationStateMachine.time += deltaTime; // Update State Timer
                // Check Local Transition Conditions
                this.checkStateTransitions(layer, layer.animationStateMachine.transitions);
                // Check Any State Transition Conditions
                if (this._checkers.result == null && this._machine.transitions != null) {
                    this.checkStateTransitions(layer, this._machine.transitions);
                }
            }
            // ..
            // Reset Transition Condition Triggers
            // ..
            if (this._checkers.triggered != null && this._checkers.triggered.length > 0) {
                this._checkers.triggered.forEach(function (trigger) { _this.resetTrigger(trigger); });
                this._checkers.triggered = null;
            }
            // ..
            // Set Current Machine State Result
            // ..
            if (this._checkers.result != null) {
                this.playCurrentAnimationState(layer, this._checkers.result, this._checkers.blending, this._checkers.offest);
            }
        };
        AnimationState.prototype.checkStateTransitions = function (layer, transitions) {
            var _this = this;
            var currentAnimationRate = layer.animationStateMachine.rate;
            var currentAnimationLength = layer.animationStateMachine.length;
            if (transitions != null && transitions.length > 0) {
                var i = 0;
                var ii = 0;
                var solo = -1;
                // ..
                // Check Has Solo Transitions
                // ..
                for (i = 0; i < transitions.length; i++) {
                    if (transitions[i].solo === true && transitions[i].mute === false) {
                        solo = i;
                        break;
                    }
                }
                var _loop_1 = function () {
                    var transition = transitions[i];
                    if (transition.layerIndex !== layer.index)
                        return "continue";
                    if (transition.mute === true)
                        return "continue";
                    if (solo >= 0 && solo !== i)
                        return "continue";
                    var transitionOk = false;
                    // ..
                    // Check Has Transition Exit Time
                    // ..
                    var exitTimeSecs = 0;
                    var exitTimeExpired = true;
                    if (transition.exitTime > 0) {
                        exitTimeSecs = (currentAnimationLength * transition.exitTime); // Note: Is Normalized Transition Exit Time
                        exitTimeExpired = (transition.hasExitTime === true) ? (layer.animationStateMachine.time >= exitTimeSecs) : true;
                    }
                    if (transition.hasExitTime === true && transition.intSource == BABYLON.InterruptionSource.None && exitTimeExpired === false)
                        return "continue";
                    // ..
                    // Check All Transition Conditions
                    // ..
                    if (transition.conditions != null && transition.conditions.length > 0) {
                        var passed_1 = 0;
                        var checks = transition.conditions.length;
                        transition.conditions.forEach(function (condition) {
                            var ptype = _this._parameters.get(condition.parameter);
                            if (ptype != null) {
                                if (ptype == BABYLON.AnimatorParameterType.Float || ptype == BABYLON.AnimatorParameterType.Int) {
                                    var numValue = parseFloat(_this.getFloat(condition.parameter).toFixed(2));
                                    if (condition.mode === BABYLON.ConditionMode.Greater && numValue > condition.threshold) {
                                        passed_1++;
                                    }
                                    else if (condition.mode === BABYLON.ConditionMode.Less && numValue < condition.threshold) {
                                        passed_1++;
                                    }
                                    else if (condition.mode === BABYLON.ConditionMode.Equals && numValue === condition.threshold) {
                                        passed_1++;
                                    }
                                    else if (condition.mode === BABYLON.ConditionMode.NotEqual && numValue !== condition.threshold) {
                                        passed_1++;
                                    }
                                }
                                else if (ptype == BABYLON.AnimatorParameterType.Bool) {
                                    var boolValue = _this.getBool(condition.parameter);
                                    if (condition.mode === BABYLON.ConditionMode.If && boolValue === true) {
                                        passed_1++;
                                    }
                                    else if (condition.mode === BABYLON.ConditionMode.IfNot && boolValue === false) {
                                        passed_1++;
                                    }
                                }
                                else if (ptype == BABYLON.AnimatorParameterType.Trigger) {
                                    var triggerValue = _this.getTrigger(condition.parameter);
                                    if (triggerValue === true) {
                                        passed_1++;
                                        // Note: For Loop Faster Than IndexOf
                                        var indexOfTrigger = -1;
                                        for (var i_1 = 0; i_1 < _this._checkers.triggered.length; i_1++) {
                                            if (_this._checkers.triggered[i_1] === condition.parameter) {
                                                indexOfTrigger = i_1;
                                                break;
                                            }
                                        }
                                        if (indexOfTrigger < 0) {
                                            _this._checkers.triggered.push(condition.parameter);
                                        }
                                    }
                                }
                            }
                        });
                        if (transition.hasExitTime === true) {
                            // ..
                            // TODO - CHECK TRANSITION INTERUPTION SOURCE STATUS
                            // ..
                            // Validate Transition Has Exit Time And All Conditions Passed
                            transitionOk = (exitTimeExpired === true && passed_1 === checks);
                        }
                        else {
                            // Validate All Transition Conditions Passed
                            transitionOk = (passed_1 === checks);
                        }
                    }
                    else {
                        // Validate Transition Has Expired Exit Time Only
                        transitionOk = (transition.hasExitTime === true && exitTimeExpired === true);
                    }
                    // Validate Current Transition Destination Change
                    if (transitionOk === true) {
                        var blendRate = (currentAnimationRate > 0) ? currentAnimationRate : BABYLON.AnimationState.FPS;
                        var destState = (transition.isExit === false) ? transition.destination : BABYLON.AnimationState.EXIT;
                        var durationSecs = (transition.fixedDuration === true) ? transition.duration : BABYLON.Scalar.Denormalize(transition.duration, 0, currentAnimationLength);
                        var blendingSpeed = BABYLON.Utilities.ComputeBlendingSpeed(blendRate, durationSecs);
                        var normalizedOffset = transition.offset; // Note: Is Normalized Transition Offset Time
                        this_1._checkers.result = destState;
                        this_1._checkers.offest = normalizedOffset;
                        this_1._checkers.blending = blendingSpeed;
                        return "break";
                    }
                };
                var this_1 = this;
                // ..
                // Check State Machine Transitions
                // ..
                for (i = 0; i < transitions.length; i++) {
                    var state_1 = _loop_1();
                    if (state_1 === "break")
                        break;
                }
            }
        };
        AnimationState.prototype.playCurrentAnimationState = function (layer, name, blending, normalizedOffset) {
            if (normalizedOffset === void 0) { normalizedOffset = 0; }
            if (layer == null)
                return;
            if (name == null || name === "" || name === BABYLON.AnimationState.EXIT)
                return;
            if (layer.animationStateMachine != null && layer.animationStateMachine.name === name)
                return;
            var state = this.getMachineState(name);
            // ..
            // Reset Animation Target Mixers
            // ..
            if (this.m_animationTargets != null && this.m_animationTargets.length > 0) {
                this.m_animationTargets.forEach(function (targetedAnim) {
                    var animationTarget = targetedAnim.target;
                    if (animationTarget.metadata != null && animationTarget.metadata.mixer != null) {
                        var animationTargetMixer = animationTarget.metadata.mixer[layer.index];
                        if (animationTargetMixer != null) {
                            animationTargetMixer.originalMatrix = null;
                            animationTargetMixer.blendingFactor = 0;
                            animationTargetMixer.blendingSpeed = blending;
                        }
                    }
                });
            }
            // ..
            // Play Current Layer Animation State
            // ..
            if (state != null && state.layerIndex === layer.index) {
                state.time = 0;
                state.played = 0;
                state.interrupted = false;
                layer.animationTime = BABYLON.Scalar.Clamp(normalizedOffset);
                layer.animationNormal = 0;
                layer.animationFirstRun = true;
                layer.animationEndFrame = false;
                layer.animationLoopFrame = false;
                layer.animationLoopCount = 0;
                layer.animationLoopEvents = null;
                layer.animationStateMachine = state;
                // console.warn(">>> Play Animation State: " + this.transform.name + " --> " + name + " --> Foot IK: " + layer.animationStateMachine.iKOnFeet);
            }
        };
        AnimationState.prototype.stopCurrentAnimationState = function (layer) {
            if (layer == null)
                return;
            // ..
            // Reset Animation Target Mixers
            // ..
            if (this.m_animationTargets != null && this.m_animationTargets.length > 0) {
                this.m_animationTargets.forEach(function (targetedAnim) {
                    var animationTarget = targetedAnim.target;
                    if (animationTarget.metadata != null && animationTarget.metadata.mixer != null) {
                        var animationTargetMixer = animationTarget.metadata.mixer[layer.index];
                        if (animationTargetMixer != null) {
                            animationTargetMixer.originalMatrix = null;
                            animationTargetMixer.blendingFactor = 0;
                            animationTargetMixer.blendingSpeed = 0;
                        }
                    }
                });
            }
            // ..
            // Stop Current Layer Animation State
            // ..
            layer.animationTime = 0;
            layer.animationNormal = 0;
            layer.animationFirstRun = true;
            layer.animationEndFrame = false;
            layer.animationLoopFrame = false;
            layer.animationLoopCount = 0;
            layer.animationLoopEvents = null;
            layer.animationStateMachine = null;
        };
        AnimationState.prototype.checkAvatarTransformPath = function (layer, transformPath) {
            var result = false;
            if (layer.animationMaskMap != null) {
                var transformIndex = layer.animationMaskMap.get(transformPath);
                if (transformIndex != null && transformIndex >= 0) {
                    result = true;
                }
            }
            return result;
        };
        AnimationState.prototype.filterTargetAvatarMask = function (layer, target) {
            var result = false;
            if (target.metadata != null && target.metadata.unity != null && target.metadata.unity.bone != null && target.metadata.unity.bone !== "") {
                var transformPath = target.metadata.unity.bone;
                result = this.checkAvatarTransformPath(layer, transformPath);
            }
            return result;
        };
        AnimationState.prototype.sortWeightedBlendingList = function (weightList) {
            if (weightList != null && weightList.length > 0) {
                // Sort In Descending Order
                weightList.sort(function (left, right) {
                    if (left.weight < right.weight)
                        return 1;
                    if (left.weight > right.weight)
                        return -1;
                    return 0;
                });
            }
        };
        AnimationState.prototype.computeWeightedFrameRatio = function (weightList) {
            var result = 1.0;
            if (weightList != null && weightList.length > 0) {
                this.sortWeightedBlendingList(weightList);
                this._blendWeights.primary = weightList[0];
                var primaryWeight = this._blendWeights.primary.weight;
                if (primaryWeight < 1.0 && weightList.length > 1) {
                    this._blendWeights.secondary = weightList[1];
                }
                // ..
                if (this._blendWeights.primary != null && this._blendWeights.secondary != null) {
                    var frameWeightDelta = BABYLON.Scalar.Clamp(this._blendWeights.primary.weight);
                    result = BABYLON.Scalar.Lerp(this._blendWeights.secondary.ratio, this._blendWeights.primary.ratio, frameWeightDelta);
                }
                else if (this._blendWeights.primary != null && this._blendWeights.secondary == null) {
                    result = this._blendWeights.primary.ratio;
                }
            }
            return result;
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////
        // Blend Tree Branches -  Helper Functions
        ///////////////////////////////////////////////////////////////////////////////////////////////
        AnimationState.prototype.setupTreeBranches = function (tree) {
            var _this = this;
            if (tree != null && tree.children != null && tree.children.length > 0) {
                tree.children.forEach(function (child) {
                    if (child.type === BABYLON.MotionType.Tree) {
                        _this.setupTreeBranches(child.subtree);
                    }
                    else if (child.type === BABYLON.MotionType.Clip) {
                        if (child.motion != null && child.motion !== "") {
                            child.weight = 0;
                            child.ratio = 0;
                            child.track = _this.getAnimationGroup(child.motion);
                            if (child.track != null)
                                child.ratio = (BABYLON.AnimationState.TIME / child.track.to);
                        }
                    }
                });
            }
        };
        AnimationState.prototype.parseTreeBranches = function (layer, tree, parentWeight, weightList) {
            if (tree != null) {
                tree.valueParameterX = (tree.blendParameterX != null) ? parseFloat(this.getFloat(tree.blendParameterX).toFixed(2)) : 0;
                tree.valueParameterY = (tree.blendParameterY != null) ? parseFloat(this.getFloat(tree.blendParameterY).toFixed(2)) : 0;
                switch (tree.blendType) {
                    case BABYLON.BlendTreeType.Simple1D:
                        this.parse1DSimpleTreeBranches(layer, tree, parentWeight, weightList);
                        break;
                    case BABYLON.BlendTreeType.SimpleDirectional2D:
                        this.parse2DSimpleDirectionalTreeBranches(layer, tree, parentWeight, weightList);
                        break;
                    case BABYLON.BlendTreeType.FreeformDirectional2D:
                        this.parse2DFreeformDirectionalTreeBranches(layer, tree, parentWeight, weightList);
                        break;
                    case BABYLON.BlendTreeType.FreeformCartesian2D:
                        this.parse2DFreeformCartesianTreeBranches(layer, tree, parentWeight, weightList);
                        break;
                }
            }
        };
        AnimationState.prototype.parse1DSimpleTreeBranches = function (layer, tree, parentWeight, weightList) {
            var _this = this;
            if (tree != null && tree.children != null && tree.children.length > 0) {
                var blendTreeArray_1 = [];
                tree.children.forEach(function (child) {
                    child.weight = 0; // Note: Reset Weight Value
                    var item = {
                        source: child,
                        motion: child.motion,
                        posX: child.threshold,
                        posY: child.threshold,
                        weight: child.weight
                    };
                    blendTreeArray_1.push(item);
                });
                BABYLON.BlendTreeSystem.Calculate1DSimpleBlendTree(tree.valueParameterX, blendTreeArray_1);
                blendTreeArray_1.forEach(function (element) {
                    if (element.source != null) {
                        element.source.weight = element.weight;
                    }
                });
                tree.children.forEach(function (child) {
                    child.weight *= parentWeight; // Note: Scale Weight Value
                    if (child.type === BABYLON.MotionType.Clip) {
                        if (child.weight > 0) {
                            weightList.push(child);
                        }
                    }
                    if (child.type === BABYLON.MotionType.Tree) {
                        _this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                    }
                });
            }
        };
        AnimationState.prototype.parse2DSimpleDirectionalTreeBranches = function (layer, tree, parentWeight, weightList) {
            var _this = this;
            if (tree != null && tree.children != null && tree.children.length > 0) {
                var blendTreeArray_2 = [];
                tree.children.forEach(function (child) {
                    child.weight = 0; // Note: Reset Weight Value
                    var item = {
                        source: child,
                        motion: child.motion,
                        posX: child.positionX,
                        posY: child.positionY,
                        weight: child.weight
                    };
                    blendTreeArray_2.push(item);
                });
                BABYLON.BlendTreeSystem.Calculate2DFreeformDirectional(tree.valueParameterX, tree.valueParameterY, blendTreeArray_2);
                blendTreeArray_2.forEach(function (element) {
                    if (element.source != null) {
                        element.source.weight = element.weight;
                    }
                });
                tree.children.forEach(function (child) {
                    child.weight *= parentWeight; // Note: Scale Weight Value
                    if (child.type === BABYLON.MotionType.Clip) {
                        if (child.weight > 0) {
                            weightList.push(child);
                        }
                    }
                    if (child.type === BABYLON.MotionType.Tree) {
                        _this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                    }
                });
            }
        };
        AnimationState.prototype.parse2DFreeformDirectionalTreeBranches = function (layer, tree, parentWeight, weightList) {
            var _this = this;
            if (tree != null && tree.children != null && tree.children.length > 0) {
                var blendTreeArray_3 = [];
                tree.children.forEach(function (child) {
                    child.weight = 0; // Note: Reset Weight Value
                    var item = {
                        source: child,
                        motion: child.motion,
                        posX: child.positionX,
                        posY: child.positionY,
                        weight: child.weight
                    };
                    blendTreeArray_3.push(item);
                });
                BABYLON.BlendTreeSystem.Calculate2DFreeformDirectional(tree.valueParameterX, tree.valueParameterY, blendTreeArray_3);
                blendTreeArray_3.forEach(function (element) {
                    if (element.source != null) {
                        element.source.weight = element.weight;
                    }
                });
                tree.children.forEach(function (child) {
                    child.weight *= parentWeight; // Note: Scale Weight Value
                    if (child.type === BABYLON.MotionType.Clip) {
                        if (child.weight > 0) {
                            weightList.push(child);
                        }
                    }
                    if (child.type === BABYLON.MotionType.Tree) {
                        _this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                    }
                });
            }
        };
        AnimationState.prototype.parse2DFreeformCartesianTreeBranches = function (layer, tree, parentWeight, weightList) {
            var _this = this;
            if (tree != null && tree.children != null && tree.children.length > 0) {
                var blendTreeArray_4 = [];
                tree.children.forEach(function (child) {
                    child.weight = 0; // Note: Reset Weight Value
                    var item = {
                        source: child,
                        motion: child.motion,
                        posX: child.positionX,
                        posY: child.positionY,
                        weight: child.weight
                    };
                    blendTreeArray_4.push(item);
                });
                BABYLON.BlendTreeSystem.Calculate2DFreeformCartesian(tree.valueParameterX, tree.valueParameterY, blendTreeArray_4);
                blendTreeArray_4.forEach(function (element) {
                    if (element.source != null) {
                        element.source.weight = element.weight;
                    }
                });
                tree.children.forEach(function (child) {
                    child.weight *= parentWeight; // Note: Scale Weight Value
                    if (child.type === BABYLON.MotionType.Clip) {
                        if (child.weight > 0) {
                            weightList.push(child);
                        }
                    }
                    if (child.type === BABYLON.MotionType.Tree) {
                        _this.parseTreeBranches(layer, child.subtree, child.weight, weightList);
                    }
                });
            }
        };
        AnimationState.FPS = 30;
        AnimationState.EXIT = "[EXIT]";
        AnimationState.TIME = 1; // Note: Must Be One Second Normalized Time
        AnimationState.SPEED = 1.025; // Note: Animation State Blend Speed Factor
        return AnimationState;
    }(BABYLON.ScriptComponent));
    BABYLON.AnimationState = AnimationState;
    ///////////////////////////////////////////
    // Support Classes, Blend Tree Utilities
    ///////////////////////////////////////////
    var BlendTreeValue = /** @class */ (function () {
        function BlendTreeValue(config) {
            this.source = config.source;
            this.motion = config.motion;
            this.posX = config.posX || 0;
            this.posY = config.posY || 0;
            this.weight = config.weight || 0;
        }
        return BlendTreeValue;
    }());
    BABYLON.BlendTreeValue = BlendTreeValue;
    var BlendTreeUtils = /** @class */ (function () {
        function BlendTreeUtils() {
        }
        BlendTreeUtils.ClampValue = function (num, min, max) {
            return num <= min ? min : num >= max ? max : num;
        };
        BlendTreeUtils.GetSignedAngle = function (a, b) {
            return Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
        };
        BlendTreeUtils.GetLinearInterpolation = function (x0, y0, x1, y1, x) {
            return y0 + (x - x0) * ((y1 - y0) / (x1 - x0));
        };
        BlendTreeUtils.GetRightNeighbourIndex = function (inputX, blendTreeArray) {
            blendTreeArray.sort(function (a, b) { return (a.posX - b.posX); });
            for (var i = 0; i < blendTreeArray.length; ++i) {
                if (blendTreeArray[i].posX > inputX) {
                    return i;
                }
            }
            return -1;
        };
        return BlendTreeUtils;
    }());
    BABYLON.BlendTreeUtils = BlendTreeUtils;
    var BlendTreeSystem = /** @class */ (function () {
        function BlendTreeSystem() {
        }
        BlendTreeSystem.Calculate1DSimpleBlendTree = function (inputX, blendTreeArray) {
            var firstBlendTree = blendTreeArray[0];
            var lastBlendTree = blendTreeArray[blendTreeArray.length - 1];
            if (inputX <= firstBlendTree.posX) {
                firstBlendTree.weight = 1;
            }
            else if (inputX >= lastBlendTree.posX) {
                lastBlendTree.weight = 1;
            }
            else {
                var rightNeighbourBlendTreeIndex = BABYLON.BlendTreeUtils.GetRightNeighbourIndex(inputX, blendTreeArray);
                var leftNeighbour = blendTreeArray[rightNeighbourBlendTreeIndex - 1];
                var rightNeighbour = blendTreeArray[rightNeighbourBlendTreeIndex];
                var interpolatedValue = BABYLON.BlendTreeUtils.GetLinearInterpolation(leftNeighbour.posX, 1, rightNeighbour.posX, 0, inputX);
                leftNeighbour.weight = interpolatedValue;
                rightNeighbour.weight = 1 - leftNeighbour.weight;
            }
        };
        BlendTreeSystem.Calculate2DFreeformDirectional = function (inputX, inputY, blendTreeArray) {
            BABYLON.BlendTreeSystem.TempVector2_IP.set(inputX, inputY);
            BABYLON.BlendTreeSystem.TempVector2_POSI.set(0, 0);
            BABYLON.BlendTreeSystem.TempVector2_POSJ.set(0, 0);
            BABYLON.BlendTreeSystem.TempVector2_POSIP.set(0, 0);
            BABYLON.BlendTreeSystem.TempVector2_POSIJ.set(0, 0);
            var kDirScale = 2;
            var totalWeight = 0;
            var inputLength = BABYLON.BlendTreeSystem.TempVector2_IP.length();
            for (var i = 0; i < blendTreeArray.length; ++i) {
                var blendTree = blendTreeArray[i];
                BABYLON.BlendTreeSystem.TempVector2_POSI.set(blendTree.posX, blendTree.posY);
                var posILength = BABYLON.BlendTreeSystem.TempVector2_POSI.length();
                var inputToPosILength = (inputLength - posILength);
                var posIToInputAngle = BABYLON.BlendTreeUtils.GetSignedAngle(BABYLON.BlendTreeSystem.TempVector2_POSI, BABYLON.BlendTreeSystem.TempVector2_IP);
                var weight = 1;
                for (var j = 0; j < blendTreeArray.length; ++j) {
                    if (j === i) {
                        continue;
                    }
                    else {
                        BABYLON.BlendTreeSystem.TempVector2_POSJ.set(blendTreeArray[j].posX, blendTreeArray[j].posY);
                        var posJLength = BABYLON.BlendTreeSystem.TempVector2_POSJ.length();
                        var averageLengthOfIJ = (posILength + posJLength) / 2;
                        var magOfPosIToInputPos = (inputToPosILength / averageLengthOfIJ);
                        var magOfIJ = (posJLength - posILength) / averageLengthOfIJ;
                        var angleIJ = BABYLON.BlendTreeUtils.GetSignedAngle(BABYLON.BlendTreeSystem.TempVector2_POSI, BABYLON.BlendTreeSystem.TempVector2_POSJ);
                        BABYLON.BlendTreeSystem.TempVector2_POSIP.set(magOfPosIToInputPos, posIToInputAngle * kDirScale);
                        BABYLON.BlendTreeSystem.TempVector2_POSIJ.set(magOfIJ, angleIJ * kDirScale);
                        var lenSqIJ = BABYLON.BlendTreeSystem.TempVector2_POSIJ.lengthSquared();
                        var newWeight = BABYLON.Vector2.Dot(BABYLON.BlendTreeSystem.TempVector2_POSIP, BABYLON.BlendTreeSystem.TempVector2_POSIJ) / lenSqIJ;
                        newWeight = 1 - newWeight;
                        newWeight = BABYLON.BlendTreeUtils.ClampValue(newWeight, 0, 1);
                        weight = Math.min(newWeight, weight);
                    }
                }
                blendTree.weight = weight;
                totalWeight += weight;
            }
            for (var _i = 0, blendTreeArray_5 = blendTreeArray; _i < blendTreeArray_5.length; _i++) {
                var blendTree = blendTreeArray_5[_i];
                blendTree.weight /= totalWeight;
            }
        };
        BlendTreeSystem.Calculate2DFreeformCartesian = function (inputX, inputY, blendTreeArray) {
            BABYLON.BlendTreeSystem.TempVector2_IP.set(inputX, inputY);
            BABYLON.BlendTreeSystem.TempVector2_POSI.set(0, 0);
            BABYLON.BlendTreeSystem.TempVector2_POSJ.set(0, 0);
            BABYLON.BlendTreeSystem.TempVector2_POSIP.set(0, 0);
            BABYLON.BlendTreeSystem.TempVector2_POSIJ.set(0, 0);
            var totalWeight = 0;
            for (var i = 0; i < blendTreeArray.length; ++i) {
                var blendTree = blendTreeArray[i];
                BABYLON.BlendTreeSystem.TempVector2_POSI.set(blendTree.posX, blendTree.posY);
                BABYLON.BlendTreeSystem.TempVector2_IP.subtractToRef(BABYLON.BlendTreeSystem.TempVector2_POSI, BABYLON.BlendTreeSystem.TempVector2_POSIP);
                var weight = 1;
                for (var j = 0; j < blendTreeArray.length; ++j) {
                    if (j === i) {
                        continue;
                    }
                    else {
                        BABYLON.BlendTreeSystem.TempVector2_POSJ.set(blendTreeArray[j].posX, blendTreeArray[j].posY);
                        BABYLON.BlendTreeSystem.TempVector2_POSJ.subtractToRef(BABYLON.BlendTreeSystem.TempVector2_POSI, BABYLON.BlendTreeSystem.TempVector2_POSIJ);
                        var lenSqIJ = BABYLON.BlendTreeSystem.TempVector2_POSIJ.lengthSquared();
                        var newWeight = BABYLON.Vector2.Dot(BABYLON.BlendTreeSystem.TempVector2_POSIP, BABYLON.BlendTreeSystem.TempVector2_POSIJ) / lenSqIJ;
                        newWeight = 1 - newWeight;
                        newWeight = BABYLON.BlendTreeUtils.ClampValue(newWeight, 0, 1);
                        weight = Math.min(weight, newWeight);
                    }
                }
                blendTree.weight = weight;
                totalWeight += weight;
            }
            for (var _i = 0, blendTreeArray_6 = blendTreeArray; _i < blendTreeArray_6.length; _i++) {
                var blendTree = blendTreeArray_6[_i];
                blendTree.weight /= totalWeight;
            }
        };
        BlendTreeSystem.TempVector2_IP = new BABYLON.Vector2(0, 0);
        BlendTreeSystem.TempVector2_POSI = new BABYLON.Vector2(0, 0);
        BlendTreeSystem.TempVector2_POSJ = new BABYLON.Vector2(0, 0);
        BlendTreeSystem.TempVector2_POSIP = new BABYLON.Vector2(0, 0);
        BlendTreeSystem.TempVector2_POSIJ = new BABYLON.Vector2(0, 0);
        return BlendTreeSystem;
    }());
    BABYLON.BlendTreeSystem = BlendTreeSystem;
    ///////////////////////////////////////////
    // Support Classes, Enums And Interfaces
    ///////////////////////////////////////////
    var MachineState = /** @class */ (function () {
        function MachineState() {
        }
        return MachineState;
    }());
    BABYLON.MachineState = MachineState;
    var TransitionCheck = /** @class */ (function () {
        function TransitionCheck() {
        }
        return TransitionCheck;
    }());
    BABYLON.TransitionCheck = TransitionCheck;
    var AnimationMixer = /** @class */ (function () {
        function AnimationMixer() {
        }
        return AnimationMixer;
    }());
    BABYLON.AnimationMixer = AnimationMixer;
    var BlendingWeights = /** @class */ (function () {
        function BlendingWeights() {
        }
        return BlendingWeights;
    }());
    BABYLON.BlendingWeights = BlendingWeights;
    var MotionType;
    (function (MotionType) {
        MotionType[MotionType["Clip"] = 0] = "Clip";
        MotionType[MotionType["Tree"] = 1] = "Tree";
    })(MotionType = BABYLON.MotionType || (BABYLON.MotionType = {}));
    var ConditionMode;
    (function (ConditionMode) {
        ConditionMode[ConditionMode["If"] = 1] = "If";
        ConditionMode[ConditionMode["IfNot"] = 2] = "IfNot";
        ConditionMode[ConditionMode["Greater"] = 3] = "Greater";
        ConditionMode[ConditionMode["Less"] = 4] = "Less";
        ConditionMode[ConditionMode["Equals"] = 6] = "Equals";
        ConditionMode[ConditionMode["NotEqual"] = 7] = "NotEqual";
    })(ConditionMode = BABYLON.ConditionMode || (BABYLON.ConditionMode = {}));
    var InterruptionSource;
    (function (InterruptionSource) {
        InterruptionSource[InterruptionSource["None"] = 0] = "None";
        InterruptionSource[InterruptionSource["Source"] = 1] = "Source";
        InterruptionSource[InterruptionSource["Destination"] = 2] = "Destination";
        InterruptionSource[InterruptionSource["SourceThenDestination"] = 3] = "SourceThenDestination";
        InterruptionSource[InterruptionSource["DestinationThenSource"] = 4] = "DestinationThenSource";
    })(InterruptionSource = BABYLON.InterruptionSource || (BABYLON.InterruptionSource = {}));
    var BlendTreeType;
    (function (BlendTreeType) {
        BlendTreeType[BlendTreeType["Simple1D"] = 0] = "Simple1D";
        BlendTreeType[BlendTreeType["SimpleDirectional2D"] = 1] = "SimpleDirectional2D";
        BlendTreeType[BlendTreeType["FreeformDirectional2D"] = 2] = "FreeformDirectional2D";
        BlendTreeType[BlendTreeType["FreeformCartesian2D"] = 3] = "FreeformCartesian2D";
        BlendTreeType[BlendTreeType["Direct"] = 4] = "Direct";
        BlendTreeType[BlendTreeType["Clip"] = 5] = "Clip";
    })(BlendTreeType = BABYLON.BlendTreeType || (BABYLON.BlendTreeType = {}));
    var BlendTreePosition;
    (function (BlendTreePosition) {
        BlendTreePosition[BlendTreePosition["Lower"] = 0] = "Lower";
        BlendTreePosition[BlendTreePosition["Upper"] = 1] = "Upper";
    })(BlendTreePosition = BABYLON.BlendTreePosition || (BABYLON.BlendTreePosition = {}));
    var AnimatorParameterType;
    (function (AnimatorParameterType) {
        AnimatorParameterType[AnimatorParameterType["Float"] = 1] = "Float";
        AnimatorParameterType[AnimatorParameterType["Int"] = 3] = "Int";
        AnimatorParameterType[AnimatorParameterType["Bool"] = 4] = "Bool";
        AnimatorParameterType[AnimatorParameterType["Trigger"] = 9] = "Trigger";
    })(AnimatorParameterType = BABYLON.AnimatorParameterType || (BABYLON.AnimatorParameterType = {}));
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon audio source manager pro class
     * @class AudioSource - All rights reserved (c) 2020 Mackey Kinard
     */
    var AudioSource = /** @class */ (function (_super) {
        __extends(AudioSource, _super);
        function AudioSource() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._audio = null;
            _this._name = null;
            _this._loop = false;
            _this._mute = false;
            _this._pitch = 1;
            _this._volume = 1;
            _this._preload = false;
            _this._priority = 128;
            _this._panstereo = 0;
            _this._mindistance = 1;
            _this._maxdistance = 50;
            _this._rolloffmode = "linear";
            _this._rollofffactor = 1;
            _this._playonawake = true;
            _this._spatialblend = 0;
            _this._preloaderUrl = null;
            _this._reverbzonemix = 1;
            _this._lastmutedvolume = null;
            _this._bypasseffects = false;
            _this._bypassreverbzones = false;
            _this._bypasslistenereffects = false;
            _this._initializedReadyInstance = false;
            /** Register handler that is triggered when the audio clip is ready */
            _this.onReadyObservable = new BABYLON.Observable();
            return _this;
        }
        AudioSource.prototype.getSoundClip = function () { return this._audio; };
        AudioSource.prototype.getAudioElement = function () { return (this._audio != null) ? this._audio._htmlAudioElement : null; };
        AudioSource.prototype.awake = function () { this.awakeAudioSource(); };
        AudioSource.prototype.destroy = function () { this.destroyAudioSource(); };
        AudioSource.prototype.awakeAudioSource = function () {
            this._name = this.getProperty("name", this._name);
            this._loop = this.getProperty("loop", this._loop);
            this._mute = this.getProperty("mute", this._mute);
            this._pitch = this.getProperty("pitch", this._pitch);
            this._volume = this.getProperty("volume", this._volume);
            this._preload = this.getProperty("preload", this._preload);
            this._priority = this.getProperty("priority", this._priority);
            this._panstereo = this.getProperty("panstereo", this._panstereo);
            this._playonawake = this.getProperty("playonawake", this._playonawake);
            this._mindistance = this.getProperty("mindistance", this._mindistance);
            this._maxdistance = this.getProperty("maxdistance", this._maxdistance);
            this._rolloffmode = this.getProperty("rolloffmode", this._rolloffmode);
            this._rollofffactor = this.getProperty("rollofffactor", this._rollofffactor);
            this._spatialblend = this.getProperty("spatialblend", this._spatialblend);
            this._reverbzonemix = this.getProperty("reverbzonemix", this._reverbzonemix);
            this._bypasseffects = this.getProperty("bypasseffects", this._bypasseffects);
            this._bypassreverbzones = this.getProperty("bypassreverbzones", this._bypassreverbzones);
            this._bypasslistenereffects = this.getProperty("bypasslistenereffects", this._bypasslistenereffects);
            if (this._name == null || this._name === "")
                this._name = "Unknown";
            // ..
            var filename = this.getProperty("file");
            if (filename != null && filename !== "") {
                var rootUrl = BABYLON.SceneManager.GetRootUrl(this.scene);
                var playUrl = (rootUrl + filename);
                if (playUrl != null && playUrl !== "") {
                    if (this._preload === true) {
                        this._preloaderUrl = playUrl;
                    }
                    else {
                        this.setDataSource(playUrl);
                    }
                }
            }
        };
        AudioSource.prototype.destroyAudioSource = function () {
            this.onReadyObservable.clear();
            this.onReadyObservable = null;
            if (this._audio != null) {
                this._audio.dispose();
                this._audio = null;
            }
        };
        /**
         * Gets the ready status for track
         */
        AudioSource.prototype.isReady = function () {
            var result = false;
            if (this._audio != null) {
                result = this._audio.isReady();
            }
            return result;
        };
        /**
         * Gets the playing status for track
         */
        AudioSource.prototype.isPlaying = function () {
            var result = false;
            if (this._audio != null) {
                result = this._audio.isPlaying;
            }
            return result;
        };
        /**
         * Gets the paused status for track
         */
        AudioSource.prototype.isPaused = function () {
            var result = false;
            if (this._audio != null) {
                result = this._audio.isPaused;
            }
            return result;
        };
        /**
         * Play the sound track
         * @param time (optional) Start the sound after X seconds. Start immediately (0) by default.
         * @param offset (optional) Start the sound at a specific time in seconds
         * @param length (optional) Sound duration (in seconds)
         */
        AudioSource.prototype.play = function (time, offset, length) {
            var _this = this;
            if (BABYLON.SceneManager.HasAudioContext()) {
                this.internalPlay(time, offset, length);
            }
            else {
                BABYLON.Engine.audioEngine.onAudioUnlockedObservable.addOnce(function () { _this.internalPlay(time, offset, length); });
            }
            return true;
        };
        AudioSource.prototype.internalPlay = function (time, offset, length) {
            var _this = this;
            if (this._audio != null) {
                if (this._initializedReadyInstance === true) {
                    this._audio.play(time, offset, length);
                }
                else {
                    this.onReadyObservable.addOnce(function () { _this._audio.play(time, offset, length); });
                }
            }
        };
        /**
         * Pause the sound track
         */
        AudioSource.prototype.pause = function () {
            var result = false;
            if (this._audio != null) {
                this._audio.pause();
                result = true;
            }
            return result;
        };
        /**
         * Stop the sound track
         * @param time (optional) Start the sound after X seconds. Start immediately (0) by default.
         */
        AudioSource.prototype.stop = function (time) {
            var result = false;
            if (this._audio != null) {
                this._audio.stop(time);
                result = true;
            }
            return result;
        };
        /**
         * Mute the sound track
         * @param time (optional) Mute the sound after X seconds. Start immediately (0) by default.
         */
        AudioSource.prototype.mute = function (time) {
            var result = false;
            if (this._audio != null) {
                this._lastmutedvolume = this._audio.getVolume();
                this._audio.setVolume(0, time);
            }
            return result;
        };
        /**
         * Unmute the sound track
         * @param time (optional) Unmute the sound after X seconds. Start immediately (0) by default.
         */
        AudioSource.prototype.unmute = function (time) {
            var result = false;
            if (this._audio != null) {
                if (this._lastmutedvolume != null) {
                    this._audio.setVolume(this._lastmutedvolume, time);
                    this._lastmutedvolume = null;
                }
            }
            return result;
        };
        /**
         * Gets the volume of the track
         */
        AudioSource.prototype.getVolume = function () {
            var result = 0;
            if (this._audio != null) {
                result = this._audio.getVolume();
            }
            else {
                result = this._volume;
            }
            return result;
        };
        /**
         * Sets the volume of the track
         * @param volume Define the new volume of the sound
         * @param time Define time for gradual change to new volume
         */
        AudioSource.prototype.setVolume = function (volume, time) {
            var result = false;
            this._volume = volume;
            if (this._audio != null) {
                this._audio.setVolume(this._volume, time);
            }
            result = true;
            return result;
        };
        /**
         * Gets the spatial sound option of the track
         */
        AudioSource.prototype.getSpatialSound = function () {
            var result = false;
            if (this._audio != null) {
                result = this._audio.spatialSound;
            }
            return result;
        };
        /**
         * Gets the spatial sound option of the track
         * @param value Define the value of the spatial sound
         */
        AudioSource.prototype.setSpatialSound = function (value) {
            if (this._audio != null) {
                this._audio.spatialSound = value;
            }
        };
        /**
         * Sets the sound track playback speed
         * @param rate the audio playback rate
         */
        AudioSource.prototype.setPlaybackSpeed = function (rate) {
            if (this._audio != null) {
                this._audio.setPlaybackRate(rate);
            }
        };
        /**
         * Gets the current time of the track
         */
        AudioSource.prototype.getCurrentTrackTime = function () {
            var result = 0;
            if (this._audio != null) {
                result = this._audio.currentTime;
            }
            return result;
        };
        /** Set audio data source */
        AudioSource.prototype.setDataSource = function (source) {
            var _this = this;
            if (this._audio != null) {
                this._audio.dispose();
                this._audio = null;
            }
            var spatialBlend = (this._spatialblend >= 0.1);
            var distanceModel = (this._rolloffmode === "logarithmic") ? "exponential" : "linear";
            var htmlAudioElementRequired = (this.transform.metadata != null && this.transform.metadata.vtt != null && this.transform.metadata.vtt === true);
            this._initializedReadyInstance = false;
            this._audio = new BABYLON.Sound(this._name, source, this.scene, function () {
                _this._lastmutedvolume = _this._volume;
                _this._audio.setVolume((_this._mute === true) ? 0 : _this._volume);
                _this._audio.setPlaybackRate(_this._pitch);
                _this._initializedReadyInstance = true;
                if (_this.onReadyObservable.hasObservers() === true) {
                    _this.onReadyObservable.notifyObservers(_this._audio);
                }
                // ..
                // Support Auto Play On Awake
                // ..
                if (_this._playonawake === true)
                    _this.play();
            }, {
                loop: this._loop,
                autoplay: false,
                refDistance: this._mindistance,
                maxDistance: this._maxdistance,
                rolloffFactor: this._rollofffactor,
                spatialSound: spatialBlend,
                distanceModel: distanceModel,
                streaming: htmlAudioElementRequired
            });
            this._audio.setPosition(this.transform.position.clone());
            if (spatialBlend === true)
                this._audio.attachToMesh(this.transform);
        };
        /** Add audio preloader asset tasks (https://doc.babylonjs.com/divingDeeper/importers/assetManager) */
        AudioSource.prototype.addPreloaderTasks = function (assetsManager) {
            var _this = this;
            if (this._preload === true) {
                var assetTask = assetsManager.addBinaryFileTask((this.transform.name + ".AudioTask"), this._preloaderUrl);
                assetTask.onSuccess = function (task) { _this.setDataSource(task.data); };
                assetTask.onError = function (task, message, exception) { console.error(message, exception); };
            }
        };
        return AudioSource;
    }(BABYLON.ScriptComponent));
    BABYLON.AudioSource = AudioSource;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon kinematic character controller pro class (Native Bullet Physics 2.82)
     * @class CharacterController - All rights reserved (c) 2020 Mackey Kinard
     */
    var CharacterController = /** @class */ (function (_super) {
        __extends(CharacterController, _super);
        function CharacterController() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._abstractMesh = null;
            _this._avatarRadius = 0.5;
            _this._avatarHeight = 2;
            _this._centerOffset = new BABYLON.Vector3(0, 0, 0);
            _this._slopeLimit = 45;
            _this._skinWidth = 0.08;
            _this._stepOffset = 0.3; // See https://discourse.threejs.org/t/ammo-js-with-three-js/12530/47 (Works Best With 0.535 and Box Or Cylinder Shape - ???)
            _this._capsuleSegments = 16;
            _this._minMoveDistance = 0.001;
            _this._isPhysicsReady = false;
            _this._maxCollisions = 4;
            _this._createCylinderShape = false;
            _this._movementVelocity = new BABYLON.Vector3(0, 0, 0);
            _this._tmpPositionBuffer = new BABYLON.Vector3(0, 0, 0);
            _this._tmpCollisionContacts = null;
            _this.updatePosition = true;
            _this.syncGhostToTransform = true;
            /** Register handler that is triggered when the transform position has been updated */
            _this.onUpdatePositionObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the a collision contact has entered */
            _this.onCollisionEnterObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the a collision contact is active */
            _this.onCollisionStayObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the a collision contact has exited */
            _this.onCollisionExitObservable = new BABYLON.Observable();
            _this.m_character = null;
            _this.m_ghostShape = null;
            _this.m_ghostObject = null;
            _this.m_ghostCollision = null;
            _this.m_ghostTransform = null;
            _this.m_ghostPosition = null;
            _this.m_startPosition = null;
            _this.m_startTransform = null;
            _this.m_walkDirection = null;
            _this.m_warpPosition = null;
            _this.m_turningRate = 0;
            _this.m_moveDeltaX = 0;
            _this.m_moveDeltaZ = 0;
            _this.m_capsuleSize = BABYLON.Vector3.Zero();
            _this.m_physicsEngine = null;
            _this.m_characterPosition = BABYLON.Vector3.Zero();
            return _this;
        }
        CharacterController.prototype.preCreateCylinderShape = function () { this._createCylinderShape = true; };
        CharacterController.prototype.getInternalCharacter = function () { return this.m_character; };
        CharacterController.prototype.getCollisionShape = function () { return this.m_ghostShape; };
        CharacterController.prototype.getAvatarRadius = function () { return this._avatarRadius; };
        CharacterController.prototype.getAvatarHeight = function () { return this._avatarHeight; };
        CharacterController.prototype.getSkinWidth = function () { return this._skinWidth; };
        CharacterController.prototype.getStepOffset = function () { return this._stepOffset; };
        CharacterController.prototype.getCenterOffset = function () { return this._centerOffset; };
        CharacterController.prototype.getCapsuleSize = function () { return this.m_capsuleSize; };
        CharacterController.prototype.getMinMoveDistance = function () { return this._minMoveDistance; };
        CharacterController.prototype.setMinMoveDistance = function (distance) { this._minMoveDistance = distance; };
        CharacterController.prototype.getVerticalVelocity = function () { return (this.m_character != null && this.m_character.getVerticalVelocity) ? this.m_character.getVerticalVelocity() : 0; }; // Note: Toolkit Addon Function
        CharacterController.prototype.getAddedMargin = function () { return (this.m_character != null && this.m_character.getAddedMargin) ? this.m_character.getAddedMargin() : 0; }; // Note: Toolkit Addon Function
        CharacterController.prototype.setAddedMargin = function (margin) { if (this.m_character != null && this.m_character.getAddedMargin)
            this.m_character.setAddedMargin(margin); }; // Note: Toolkit Addon Function
        CharacterController.prototype.setMaxJumpHeight = function (maxJumpHeight) { if (this.m_character != null)
            this.m_character.setMaxJumpHeight(maxJumpHeight); };
        CharacterController.prototype.setFallingSpeed = function (fallSpeed) { if (this.m_character != null)
            this.m_character.setFallSpeed(fallSpeed); };
        CharacterController.prototype.getSlopeLimit = function () { return (this.m_character != null) ? this.m_character.getMaxSlope() : 0; };
        CharacterController.prototype.setSlopeLimit = function (slopeRadians) { if (this.m_character != null)
            this.m_character.setMaxSlope(slopeRadians); };
        CharacterController.prototype.setUpAxis = function (axis) { if (this.m_character != null)
            this.m_character.setUpAxis(axis); };
        CharacterController.prototype.getGravity = function () { return (this.m_character != null) ? this.m_character.getGravity() : 0; };
        CharacterController.prototype.setGravity = function (gravity) { if (this.m_character != null)
            this.m_character.setGravity(gravity); };
        CharacterController.prototype.isGrounded = function () { return (this.m_character != null) ? this.m_character.onGround() : false; };
        CharacterController.prototype.isReady = function () { return (this.m_character != null); };
        CharacterController.prototype.canJump = function () { return (this.m_character != null) ? this.m_character.canJump() : false; };
        CharacterController.prototype.internalWarp = function (position) { if (this.m_character != null)
            this.m_character.warp(position); }; // Position: Ammo.btVector3
        CharacterController.prototype.internalJump = function () { if (this.m_character != null)
            this.m_character.jump(); };
        CharacterController.prototype.internalSetJumpSpeed = function (speed) { if (this.m_character != null)
            this.m_character.setJumpSpeed(speed); };
        CharacterController.prototype.internalSetWalkDirection = function (direction) { if (this.m_character != null)
            this.m_character.setWalkDirection(direction); }; // Direction: Ammo.btVector3
        CharacterController.prototype.internalSetVelocityForTimeInterval = function (velocity, interval) { if (this.m_character != null)
            this.m_character.setVelocityForTimeInterval(velocity, interval); }; // Velocity: Ammo.btVector3
        CharacterController.prototype.awake = function () { this.awakeMovementState(); };
        CharacterController.prototype.start = function () { this.startMovementState(); };
        CharacterController.prototype.update = function () { this.updateMovementState(); };
        CharacterController.prototype.destroy = function () { this.destroyMovementState(); };
        //////////////////////////////////////////////////
        // Protected Character Movement State Functions //
        //////////////////////////////////////////////////
        CharacterController.prototype.awakeMovementState = function () {
            this._abstractMesh = this.getAbstractMesh();
            this._avatarRadius = this.getProperty("avatarRadius", this._avatarRadius);
            this._avatarHeight = this.getProperty("avatarHeight", this._avatarHeight);
            this._slopeLimit = this.getProperty("slopeLimit", this._slopeLimit);
            this._skinWidth = this.getProperty("skinWidth", this._skinWidth);
            this._stepOffset = this.getProperty("stepOffset", this._stepOffset);
            this._minMoveDistance = this.getProperty("minMoveDistance", this._minMoveDistance);
            this._capsuleSegments = this.getProperty("capsuleSegments", this._capsuleSegments);
            this.m_warpPosition = new Ammo.btVector3(0, 0, 0);
            this.m_walkDirection = new Ammo.btVector3(0, 0, 0);
            this.m_physicsEngine = BABYLON.SceneManager.GetPhysicsEngine(this.scene);
            var centerOffsetData = this.getProperty("centerOffset");
            if (centerOffsetData != null)
                this._centerOffset = BABYLON.Utilities.ParseVector3(centerOffsetData);
        };
        CharacterController.prototype.startMovementState = function () {
            this.setupMovementState();
            this.updateMovementState();
        };
        CharacterController.prototype.setupMovementState = function () {
            this.setMaxNotifications(this._maxCollisions);
            var world = BABYLON.SceneManager.GetPhysicsWorld(this.scene);
            if (world != null) {
                var startingPos = BABYLON.Utilities.GetAbsolutePosition(this.transform, this._centerOffset);
                this.m_startPosition = new Ammo.btVector3(startingPos.x, startingPos.y, startingPos.z);
                this.m_startTransform = new Ammo.btTransform();
                this.m_startTransform.setIdentity();
                this.m_startTransform.setOrigin(this.m_startPosition);
                // ..
                var capsuleSize = new BABYLON.Vector3(this._avatarRadius, this._avatarHeight, 1);
                capsuleSize.x *= Math.max(Math.abs(this.transform.scaling.x), Math.abs(this.transform.scaling.z));
                capsuleSize.y *= this.transform.scaling.y;
                this.m_capsuleSize.copyFrom(capsuleSize);
                // ..
                // Create a debug collision shape
                // ..
                var showDebugColliders = BABYLON.Utilities.ShowDebugColliders();
                var colliderVisibility = BABYLON.Utilities.ColliderVisibility();
                var colliderRenderGroup = BABYLON.Utilities.ColliderRenderGroup();
                if (showDebugColliders === true && this.transform._debugCollider == null) {
                    var debugName = this.transform.name + ".Debug";
                    // ELLIPSE: const debugCapsule:BABYLON.Mesh = BABYLON.MeshBuilder.CreateSphere(debugName, { segments: 16, diameterX: (capsuleSize.x * 2), diameterY: (capsuleSize.y * 1), diameterZ: (capsuleSize.x * 2) }, this.scene);
                    var debugCapsule = null;
                    if (this._createCylinderShape === true) {
                        debugCapsule = BABYLON.MeshBuilder.CreateCylinder(debugName, { tessellation: this._capsuleSegments, subdivisions: 8, height: capsuleSize.y, diameter: (capsuleSize.x * 2) }, this.scene);
                    }
                    else {
                        debugCapsule = BABYLON.MeshBuilder.CreateCapsule(debugName, { tessellation: this._capsuleSegments, subdivisions: 8, capSubdivisions: 8, height: capsuleSize.y, radius: capsuleSize.x }, this.scene);
                    }
                    debugCapsule.position.set(0, 0, 0);
                    debugCapsule.rotationQuaternion = this.transform.rotationQuaternion.clone();
                    debugCapsule.setParent(this.transform);
                    debugCapsule.position.copyFrom(this._centerOffset);
                    debugCapsule.visibility = colliderVisibility;
                    debugCapsule.renderingGroupId = colliderRenderGroup;
                    debugCapsule.material = BABYLON.Utilities.GetColliderMaterial(this.scene);
                    debugCapsule.checkCollisions = false;
                    debugCapsule.isPickable = false;
                    this.transform._debugCollider = debugCapsule;
                }
                // ELLIPSE: this.m_ghostShape = BABYLON.SceneManager.CreatePhysicsEllipsoidShape(new Ammo.btVector3(this._avatarRadius, (this._avatarHeight * 0.5), this._avatarRadius));
                if (this._createCylinderShape === true) {
                    this.m_ghostShape = new Ammo.btCylinderShape(new Ammo.btVector3(this._avatarRadius, (this._avatarHeight * 0.5), this._avatarRadius));
                }
                else {
                    this.m_ghostShape = new Ammo.btCapsuleShape(this._avatarRadius, (this._avatarHeight * 0.5));
                }
                // Set ghost shape margin size
                this.m_ghostShape.setMargin(this._skinWidth);
                // Create a ghost collision object
                this.m_ghostObject = new Ammo.btPairCachingGhostObject();
                this.m_ghostObject.setWorldTransform(this.m_startTransform);
                this.m_ghostObject.setCollisionShape(this.m_ghostShape);
                this.m_ghostObject.setCollisionFlags(BABYLON.CollisionFlags.CF_CHARACTER_OBJECT);
                this.m_ghostObject.setActivationState(4);
                this.m_ghostObject.activate(true);
                // Create a ghost collision casting
                this.m_ghostCollision = Ammo.castObject(this.m_ghostObject, Ammo.btCollisionObject);
                this.m_ghostCollision.entity = this._abstractMesh;
                // Create kinematic character controller
                this.m_character = new Ammo.btKinematicCharacterController(this.m_ghostObject, this.m_ghostShape, this._stepOffset);
                this.m_character.setUseGhostSweepTest(true);
                this.m_character.setUpInterpolate(true);
                this.m_character.setGravity(BABYLON.System.Gravity3G);
                this.m_character.setMaxSlope(BABYLON.Tools.ToRadians(this._slopeLimit + 1));
                // Add ghost object and character to world
                world.addCollisionObject(this.m_ghostObject, BABYLON.CollisionFilters.CharacterFilter, BABYLON.CollisionFilters.StaticFilter | BABYLON.CollisionFilters.DefaultFilter | BABYLON.CollisionFilters.CharacterFilter);
                world.addAction(this.m_character);
            }
            else {
                BABYLON.Tools.Warn("Null physics world detected. Failed to create character controller: " + this.transform.name);
            }
            this._isPhysicsReady = (this.m_physicsEngine != null && this._tmpCollisionContacts != null && this.m_ghostObject != null && this._abstractMesh != null);
        };
        CharacterController.prototype.syncMovementState = function () {
            if (this._isPhysicsReady === true) {
                this.m_ghostTransform = this.m_ghostObject.getWorldTransform();
                if (this.m_ghostTransform != null) {
                    this.m_ghostPosition = this.m_ghostTransform.getOrigin();
                }
                else {
                    this.m_ghostPosition = null;
                }
            }
        };
        CharacterController.prototype.updateMovementState = function () {
            this.syncMovementState();
            if (this._isPhysicsReady === true) {
                if (this.m_ghostPosition != null) {
                    if (this.updatePosition === true) {
                        // DEPRECIATED: this.transform.position.set(this.m_ghostPosition.x(), this.m_ghostPosition.y(), this.m_ghostPosition.z());
                        this.m_characterPosition.set(this.m_ghostPosition.x(), this.m_ghostPosition.y(), this.m_ghostPosition.z());
                        if (this._centerOffset != null) {
                            // Note: Subtract Character Controller Center Offset
                            this.m_characterPosition.subtractInPlace(this._centerOffset);
                        }
                        this.transform.position.copyFrom(this.m_characterPosition);
                    }
                    else {
                        if (this.syncGhostToTransform === true) {
                            this.setGhostWorldPosition(this.transform.position);
                        }
                    }
                    if (this.onUpdatePositionObservable.hasObservers() === true) {
                        this.onUpdatePositionObservable.notifyObservers(this.transform);
                    }
                }
            }
            this.parseGhostCollisionContacts();
        };
        CharacterController.prototype.parseGhostCollisionContacts = function () {
            if (this._isPhysicsReady === true) {
                var hasEnterObservers = this.onCollisionEnterObservable.hasObservers();
                var hasStayObservers = this.onCollisionStayObservable.hasObservers();
                var hasExitObservers = this.onCollisionExitObservable.hasObservers();
                if (hasEnterObservers || hasStayObservers || hasExitObservers) {
                    var index = 0; // Note: Flag All Collision List Items For End Contact State
                    for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                        this._tmpCollisionContacts[index].reset = true;
                    }
                    // ..
                    // Parse Overlapping Ghost Contact Objects
                    // ..
                    var contacts = this.m_ghostObject.getNumOverlappingObjects();
                    if (contacts > this._maxCollisions)
                        contacts = this._maxCollisions;
                    if (contacts > 0) {
                        for (index = 0; index < contacts; index++) {
                            var contactObject = this.m_ghostObject.getOverlappingObject(index);
                            if (contactObject != null) {
                                var contactBody = Ammo.castObject(contactObject, Ammo.btCollisionObject);
                                if (contactBody != null && contactBody.entity != null && contactBody.isActive()) {
                                    var foundindex = -1;
                                    var contactMesh = contactBody.entity;
                                    for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                                        var check = this._tmpCollisionContacts[index];
                                        if (check.mesh != null && check.mesh === contactMesh) {
                                            check.state = 1;
                                            check.reset = false;
                                            foundindex = index;
                                            break;
                                        }
                                    }
                                    if (foundindex === -1) {
                                        for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                                            var insert = this._tmpCollisionContacts[index];
                                            if (insert.mesh == null) {
                                                insert.mesh = contactMesh;
                                                insert.state = 0;
                                                insert.reset = false;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // ..
                    // Dispatch Ghost Collision Contact State
                    // ..
                    for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                        var info = this._tmpCollisionContacts[index];
                        if (info.reset === true) {
                            // Dispatch On Collision Exit Event
                            if (hasExitObservers && info.mesh != null) {
                                this.onCollisionExitObservable.notifyObservers(info.mesh);
                            }
                            // Reset Collision Contact Info Item
                            info.mesh = null;
                            info.state = 0;
                            info.reset = false;
                        }
                        else {
                            if (info.state === 0) {
                                // Dispatch On Collision Enter Event
                                if (hasEnterObservers && info.mesh != null) {
                                    this.onCollisionEnterObservable.notifyObservers(info.mesh);
                                }
                            }
                            else {
                                // Dispatch On Collision Stay Event
                                if (hasStayObservers && info.mesh != null) {
                                    this.onCollisionStayObservable.notifyObservers(info.mesh);
                                }
                            }
                        }
                    }
                }
            }
        };
        CharacterController.prototype.destroyMovementState = function () {
            this.m_physicsEngine = null;
            if (this.m_character != null) {
                Ammo.destroy(this.m_character);
                this.m_character = null;
            }
            if (this.m_ghostObject != null) {
                Ammo.destroy(this.m_ghostObject);
                this.m_ghostObject = null;
            }
            if (this.m_ghostShape != null) {
                Ammo.destroy(this.m_ghostShape);
                this.m_ghostShape = null;
            }
            if (this.m_ghostCollision != null) {
                Ammo.destroy(this.m_ghostCollision); // ???
                this.m_ghostCollision = null;
            }
            if (this.m_ghostPosition != null) {
                Ammo.destroy(this.m_ghostPosition); // ???
                this.m_ghostPosition = null;
            }
            if (this.m_ghostTransform != null) {
                Ammo.destroy(this.m_ghostTransform); // ???
                this.m_ghostTransform = null;
            }
            if (this.m_startPosition != null) {
                Ammo.destroy(this.m_startPosition);
                this.m_startPosition = null;
            }
            if (this.m_startTransform != null) {
                Ammo.destroy(this.m_startTransform);
                this.m_startTransform = null;
            }
            if (this.m_warpPosition != null) {
                Ammo.destroy(this.m_warpPosition);
                this.m_warpPosition = null;
            }
            if (this.m_walkDirection != null) {
                Ammo.destroy(this.m_walkDirection);
                this.m_walkDirection = null;
            }
            this.onUpdatePositionObservable.clear();
            this.onUpdatePositionObservable = null;
            this.onCollisionEnterObservable.clear();
            this.onCollisionEnterObservable = null;
            this.onCollisionStayObservable.clear();
            this.onCollisionStayObservable = null;
            this.onCollisionExitObservable.clear();
            this.onCollisionExitObservable = null;
            this._tmpCollisionContacts = null;
            this._tmpPositionBuffer = null;
            this._abstractMesh = null;
        };
        ////////////////////////////////////////////////////
        // Character Controller Advanced Helper Functions //
        ////////////////////////////////////////////////////
        /** Gets the ghost collision shape margin value. (Advanved Use Only) */
        CharacterController.prototype.getGhostMargin = function () {
            var result = 0;
            if (this.m_ghostShape != null && this.m_ghostShape.getMargin) {
                result = this.m_ghostShape.getMargin();
            }
            return result;
        };
        /** Sets ghost collision shape margin value. (Advanved Use Only) */
        CharacterController.prototype.setGhostMargin = function (margin) {
            if (this.m_ghostShape != null && this.m_ghostShape.setMargin) {
                this.m_ghostShape.setMargin(margin);
            }
        };
        /** Gets character slope slide patch state using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.getUseSlopeSlidePatch = function () {
            var result = false;
            if (this.m_character != null && this.m_character.get_m_useSlopeSlidePatch) {
                result = this.m_character.get_m_useSlopeSlidePatch();
            }
            return result;
        };
        /** Sets character slope slide patch state using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.setUseSlopeSlidePatch = function (use) {
            if (this.m_character != null && this.m_character.set_m_useSlopeSlidePatch) {
                this.m_character.set_m_useSlopeSlidePatch(use);
            }
        };
        /** Sets the maximum number of simultaneous contact notfications to dispatch per frame. Defaults value is 4. (Advanved Use Only) */
        CharacterController.prototype.setMaxNotifications = function (max) {
            this._maxCollisions = max;
            this._tmpCollisionContacts = [];
            for (var index = 0; index < this._maxCollisions; index++) {
                this._tmpCollisionContacts.push(new BABYLON.CollisionContactInfo());
            }
        };
        /** Sets character collision activation state using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.setActivationState = function (state) {
            if (this.m_ghostCollision != null && this.m_ghostCollision.setActivationState) {
                this.m_ghostCollision.setActivationState(state);
            }
        };
        /** Gets character collision group filter using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.getCollisionFilterGroup = function () {
            var result = -1;
            if (this.m_ghostCollision != null && this.m_ghostCollision.getBroadphaseHandle) {
                result = this.m_ghostCollision.getBroadphaseHandle().get_m_collisionFilterGroup();
            }
            return result;
        };
        /** Sets character collision group filter using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.setCollisionFilterGroup = function (group) {
            if (this.m_ghostCollision != null && this.m_ghostCollision.getBroadphaseHandle) {
                this.m_ghostCollision.getBroadphaseHandle().set_m_collisionFilterGroup(group);
            }
        };
        /** Gets character collision mask filter using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.getCollisionFilterMask = function () {
            var result = -1;
            if (this.m_ghostCollision != null && this.m_ghostCollision.getBroadphaseHandle) {
                result = this.m_ghostCollision.getBroadphaseHandle().get_m_collisionFilterMask();
            }
            return result;
        };
        /** Sets the character collision mask filter using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.setCollisionFilterMask = function (mask) {
            if (this.m_ghostCollision != null && this.m_ghostCollision.getBroadphaseHandle) {
                this.m_ghostCollision.getBroadphaseHandle().set_m_collisionFilterMask(mask);
            }
        };
        /** Gets the chracter contact processing threshold using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.getContactProcessingThreshold = function () {
            var result = -1;
            if (this.m_ghostCollision != null && this.m_ghostCollision.getContactProcessingThreshold) {
                result = this.m_ghostCollision.getContactProcessingThreshold();
            }
            return result;
        };
        /** Sets character contact processing threshold using physics ghost object. (Advanved Use Only) */
        CharacterController.prototype.setContactProcessingThreshold = function (threshold) {
            if (this.m_ghostCollision != null && this.m_ghostCollision.setContactProcessingThreshold) {
                this.m_ghostCollision.setContactProcessingThreshold(threshold);
            }
        };
        /** Get the current position of the physics ghost object world transform. (Advanved Use Only) */
        CharacterController.prototype.getGhostWorldPosition = function () {
            var result = new BABYLON.Vector3(0, 0, 0);
            if (this.m_ghostPosition != null) {
                result.set(this.m_ghostPosition.x(), this.m_ghostPosition.y(), this.m_ghostPosition.z());
            }
            return result;
        };
        /** Get the current position of the physics ghost object world transform. (Advanved Use Only) */
        CharacterController.prototype.getGhostWorldPositionToRef = function (result) {
            if (this.m_ghostPosition != null && result != null) {
                result.set(this.m_ghostPosition.x(), this.m_ghostPosition.y(), this.m_ghostPosition.z());
            }
        };
        /** Manually set the position of the physics ghost object world transform. (Advanved Use Only) */
        CharacterController.prototype.setGhostWorldPosition = function (position) {
            if (this.m_ghostObject != null && this.m_ghostTransform != null) {
                if (this.m_ghostPosition != null && position != null) {
                    this.m_ghostPosition.setValue(position.x, position.y, position.z);
                    this.m_ghostTransform.setOrigin(this.m_ghostPosition);
                }
                this.m_ghostObject.setWorldTransform(this.m_ghostTransform);
            }
        };
        /** Set ghost collision shape local scaling. (Advanved Use Only) */
        CharacterController.prototype.scaleGhostCollisionShape = function (x, y, z) {
            this.m_ghostShape.setLocalScaling(new Ammo.btVector3(x, y, z));
            if (this.transform._debugCollider != null && this.transform._debugCollider.scaling != null) {
                this.transform._debugCollider.scaling.set(x, y, z);
            }
        };
        ////////////////////////////////////////////////////
        // Public Character Controller Movement Functions //
        ////////////////////////////////////////////////////
        /** Sets the kinematic character position to the specified location. */
        CharacterController.prototype.set = function (x, y, z) {
            this._tmpPositionBuffer.set(x, y, z);
            this.setGhostWorldPosition(this._tmpPositionBuffer);
        };
        /** Translates the kinematic character with the specfied velocity. */
        CharacterController.prototype.move = function (velocity) {
            if (velocity != null) {
                this.m_moveDeltaX = velocity.x;
                this.m_moveDeltaZ = velocity.z;
                if (Math.abs(velocity.x) < this._minMoveDistance) {
                    if (velocity.x > 0) {
                        this.m_moveDeltaX = this._minMoveDistance;
                    }
                    else if (velocity.x < 0) {
                        this.m_moveDeltaX = -this._minMoveDistance;
                    }
                }
                if (Math.abs(velocity.z) < this._minMoveDistance) {
                    if (velocity.z > 0) {
                        this.m_moveDeltaZ = this._minMoveDistance;
                    }
                    else if (velocity.z < 0) {
                        this.m_moveDeltaZ = -this._minMoveDistance;
                    }
                }
                if (this.m_walkDirection != null) {
                    this._movementVelocity.set(this.m_moveDeltaX, 0, this.m_moveDeltaZ);
                    this.m_walkDirection.setValue(this._movementVelocity.x, this._movementVelocity.y, this._movementVelocity.z);
                    this.internalSetWalkDirection(this.m_walkDirection);
                }
            }
        };
        /** Jumps the kinematic chacracter with the specified speed. */
        CharacterController.prototype.jump = function (speed) {
            this.internalSetJumpSpeed(speed);
            this.internalJump();
        };
        /** Warps the kinematic chacracter to the specified position. */
        CharacterController.prototype.warp = function (position) {
            if (this.m_warpPosition != null) {
                this.m_warpPosition.setValue(position.x, position.y, position.z);
                this.internalWarp(this.m_warpPosition);
            }
        };
        return CharacterController;
    }(BABYLON.ScriptComponent));
    BABYLON.CharacterController = CharacterController;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon navigation agent pro class (Unity Style Navigation Agent System)
     * @class NavigationAgent - All rights reserved (c) 2020 Mackey Kinard
     */
    var NavigationAgent = /** @class */ (function (_super) {
        __extends(NavigationAgent, _super);
        function NavigationAgent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.distanceToTarget = 0;
            _this.teleporting = false;
            _this.moveDirection = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.resetPosition = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.lastPosition = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.distancePosition = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.currentPosition = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.currentRotation = new BABYLON.Quaternion(0.0, 0.0, 0.0, 1.0);
            _this.currentVelocity = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.currentWaypoint = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.heightOffset = 0;
            _this.angularSpeed = 0;
            _this.updatePosition = true;
            _this.updateRotation = true;
            _this.distanceEpsilon = 0.1;
            _this.velocityEpsilon = 1.1;
            _this.offMeshVelocity = 1.5;
            _this.stoppingDistance = 0;
            /** Register handler that is triggered when the agent is ready for navigation */
            _this.onReadyObservable = new BABYLON.Observable();
            /** Register handler that is triggered before the navigation update */
            _this.onPreUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered after the navigation update */
            _this.onPostUpdateObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the navigation is complete */
            _this.onNavCompleteObservable = new BABYLON.Observable();
            _this.m_agentState = 0;
            _this.m_agentIndex = -1;
            _this.m_agentReady = false;
            _this.m_agentGhost = null;
            _this.m_agentParams = null;
            _this.m_agentMovement = new BABYLON.Vector3(0.0, 0.0, 0.0);
            _this.m_agentDirection = new BABYLON.Vector3(0.0, 0.0, 1.0);
            _this.m_agentQuaternion = new BABYLON.Quaternion(0.0, 0.0, 0.0, 1.0);
            _this.m_agentDestination = null;
            return _this;
        }
        NavigationAgent.prototype.isReady = function () { return this.m_agentReady; };
        NavigationAgent.prototype.isNavigating = function () { return (this.m_agentDestination != null); };
        NavigationAgent.prototype.isTeleporting = function () { return this.teleporting; };
        NavigationAgent.prototype.isOnOffMeshLink = function () { return (this.m_agentState === BABYLON.CrowdAgentState.DT_CROWDAGENT_STATE_OFFMESH); };
        NavigationAgent.prototype.getAgentType = function () { return this.type; };
        NavigationAgent.prototype.getAgentState = function () { return this.m_agentState; };
        NavigationAgent.prototype.getAgentIndex = function () { return this.m_agentIndex; };
        NavigationAgent.prototype.getAgentOffset = function () { return this.baseOffset; };
        NavigationAgent.prototype.getTargetDistance = function () { return this.distanceToTarget; };
        NavigationAgent.prototype.getCurrentPosition = function () { return this.currentPosition; };
        NavigationAgent.prototype.getCurrentRotation = function () { return this.currentRotation; };
        NavigationAgent.prototype.getCurrentVelocity = function () { return this.currentVelocity; };
        NavigationAgent.prototype.getAgentParameters = function () { return this.m_agentParams; };
        NavigationAgent.prototype.setAgentParameters = function (parameters) { this.m_agentParams = parameters; this.updateAgentParameters(); };
        NavigationAgent.prototype.awake = function () { this.awakeNavigationAgent(); };
        NavigationAgent.prototype.update = function () { this.updateNavigationAgent(); };
        NavigationAgent.prototype.destroy = function () { this.destroyNavigationAgent(); };
        //////////////////////////////////////////////////////
        // Navigation Private Functions                     //
        //////////////////////////////////////////////////////
        NavigationAgent.prototype.awakeNavigationAgent = function () {
            this.type = this.getProperty("type", this.type);
            this.speed = this.getProperty("speed", this.speed);
            this.baseOffset = this.getProperty("offset", this.baseOffset);
            this.angularSpeed = this.getProperty("angularspeed", this.angularSpeed);
            this.acceleration = this.getProperty("acceleration", this.acceleration);
            this.stoppingDistance = this.getProperty("stoppingdistance", this.stoppingDistance);
            this.autoBraking = this.getProperty("autobraking", this.autoBraking);
            this.avoidRadius = this.getProperty("avoidradius", this.avoidRadius);
            this.avoidHeight = this.getProperty("avoidheight", this.avoidHeight);
            this.obstacleAvoidanceType = this.getProperty("avoidquality", this.obstacleAvoidanceType);
            this.avoidancePriority = this.getProperty("avoidpriority", this.avoidancePriority);
            this.autoTraverseOffMeshLink = this.getProperty("autotraverse", this.autoTraverseOffMeshLink);
            this.autoRepath = this.getProperty("autopepath", this.autoRepath);
            this.areaMask = this.getProperty("areamask", this.areaMask);
            // ..
            BABYLON.Utilities.ValidateTransformQuaternion(this.transform);
            // DEBUG: this.m_agentGhost = BABYLON.Mesh.CreateBox((this.transform.name + "Agent"), 1, this.scene);
            this.m_agentGhost = new BABYLON.TransformNode((this.transform.name + ".Agent"), this.scene);
            this.m_agentGhost.position = new BABYLON.Vector3(0.0, 0.0, 0.0);
            this.m_agentGhost.rotation = new BABYLON.Vector3(0.0, 0.0, 0.0);
            BABYLON.Utilities.ValidateTransformQuaternion(this.m_agentGhost);
            this.m_agentGhost.position.copyFrom(this.transform.position);
            this.lastPosition.copyFrom(this.transform.position);
        };
        NavigationAgent.prototype.updateNavigationAgent = function () {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (crowd == null)
                return; // Note: No Detour Navigation Mesh Available Yet
            if (this.m_agentIndex < 0) {
                this.m_agentParams = {
                    radius: this.avoidRadius,
                    height: this.avoidHeight,
                    maxSpeed: this.speed,
                    maxAcceleration: this.acceleration,
                    collisionQueryRange: 2.0,
                    pathOptimizationRange: 20.0,
                    separationWeight: 1.0
                };
                BABYLON.Utilities.GetAbsolutePositionToRef(this.transform, this.resetPosition);
                this.m_agentIndex = crowd.addAgent(this.resetPosition, this.m_agentParams, this.m_agentGhost);
                if (this.m_agentIndex >= 0) {
                    this.m_agentReady = true;
                    if (this.onReadyObservable.hasObservers() === true) {
                        this.onReadyObservable.notifyObservers(this.transform);
                    }
                }
                return; // Note: Start Updating Navigation Agent Next Frame
            }
            // ..
            this.m_agentState = crowd.getAgentState(this.m_agentIndex);
            this.getAgentWaypointToRef(this.currentWaypoint);
            this.getAgentPositionToRef(this.currentPosition);
            this.distancePosition.copyFrom(this.currentPosition);
            if (this.isOnOffMeshLink()) {
                this.currentPosition.subtractToRef(this.lastPosition, this.currentVelocity);
                this.currentVelocity.scaleInPlace(this.speed * this.offMeshVelocity);
            }
            else {
                this.getAgentVelocityToRef(this.currentVelocity);
            }
            if (this.onPreUpdateObservable.hasObservers() === true) {
                this.onPreUpdateObservable.notifyObservers(this.transform);
            }
            this.currentPosition.y += (this.baseOffset + this.heightOffset);
            if (this.currentVelocity.length() >= this.velocityEpsilon) {
                this.currentVelocity.normalize();
                var rotateFactor = (this.angularSpeed * BABYLON.NavigationAgent.ANGULAR_SPEED_RATIO * this.getDeltaSeconds());
                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // KEEP FOR REFERENCE: Compute Agent Orientation
                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Note: Interpolate the rotation on Y to get a smoother orientation change
                // const desiredRotation:number = Math.atan2(this.currentVelocity.x, this.currentVelocity.z);
                // this.transform.rotation.y = this.transform.rotation.y + (desiredRotation - this.transform.rotation.y) * 0.05;
                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                if (this.isOnOffMeshLink()) {
                    // Rotate Toward Velocity Direction
                    this.moveDirection.copyFrom(this.m_agentDirection);
                    this.m_agentDirection.set((this.moveDirection.x + (this.currentVelocity.x - this.moveDirection.x)), (this.moveDirection.y + (this.currentVelocity.y - this.moveDirection.y)), (this.moveDirection.z + (this.currentVelocity.z - this.moveDirection.z)));
                    this.m_agentDirection.normalize();
                    var targetAngle = (BABYLON.NavigationAgent.TARGET_ANGLE_FACTOR - Math.atan2(this.m_agentDirection.x, this.m_agentDirection.z));
                    BABYLON.Quaternion.FromEulerAnglesToRef(0.0, targetAngle, 0.0, this.currentRotation);
                    // Rotation Update
                    if (this.isNavigating() && this.updateRotation === true) {
                        BABYLON.Quaternion.SlerpToRef(this.transform.rotationQuaternion, this.currentRotation, rotateFactor, this.transform.rotationQuaternion);
                    }
                }
                else {
                    // Rotate Toward Next Target Waypoint
                    this.m_agentQuaternion.copyFrom(this.transform.rotationQuaternion);
                    if (this.isNavigating() && this.updateRotation === true) {
                        this.transform.lookAt(this.currentWaypoint);
                    }
                    // Correct Transform Look At Rotation
                    this.transform.rotationQuaternion.toEulerAnglesToRef(this.m_agentDirection);
                    BABYLON.Quaternion.FromEulerAnglesToRef(0.0, this.m_agentDirection.y, 0.0, this.currentRotation);
                    // Rotation Update
                    if (this.isNavigating() && this.updateRotation === true) {
                        BABYLON.Quaternion.SlerpToRef(this.m_agentQuaternion, this.currentRotation, rotateFactor, this.transform.rotationQuaternion);
                    }
                }
            }
            // Position Update
            if (this.isNavigating() && this.updatePosition === true) {
                this.transform.position.copyFrom(this.currentPosition);
            }
            // Target Distance
            if (this.isNavigating()) {
                this.distanceToTarget = BABYLON.Vector3.Distance(this.distancePosition, this.m_agentDestination);
                if (this.distanceToTarget <= Math.max(this.distanceEpsilon, this.stoppingDistance)) {
                    this.cancelNavigation();
                    if (this.onNavCompleteObservable.hasObservers() === true) {
                        this.onNavCompleteObservable.notifyObservers(this.transform);
                    }
                }
            }
            else {
                this.distanceToTarget = 0;
            }
            // Final Post Update
            this.lastPosition.copyFrom(this.currentPosition);
            if (this.onPostUpdateObservable.hasObservers() === true) {
                this.onPostUpdateObservable.notifyObservers(this.transform);
            }
            // Reset Teleport Flag
            this.teleporting = false;
        };
        NavigationAgent.prototype.updateAgentParameters = function () {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (crowd != null && this.m_agentIndex >= 0)
                crowd.updateAgentParameters(this.m_agentIndex, this.m_agentParams);
        };
        NavigationAgent.prototype.destroyNavigationAgent = function () {
            this.m_agentIndex = -1;
            this.m_agentReady = false;
            this.m_agentMovement = null;
            this.m_agentDirection = null;
            this.m_agentDestination = null;
            this.moveDirection = null;
            this.resetPosition = null;
            this.lastPosition = null;
            this.currentPosition = null;
            this.currentRotation = null;
            this.currentVelocity = null;
            this.currentWaypoint = null;
            this.onReadyObservable.clear();
            this.onReadyObservable = null;
            this.onPreUpdateObservable.clear();
            this.onPreUpdateObservable = null;
            this.onPostUpdateObservable.clear();
            this.onPostUpdateObservable = null;
            this.onNavCompleteObservable.clear();
            this.onNavCompleteObservable = null;
            if (this.m_agentGhost != null) {
                this.m_agentGhost.dispose();
                this.m_agentGhost = null;
            }
        };
        //////////////////////////////////////////////////////
        // Navigation Public Functions                      //
        //////////////////////////////////////////////////////
        /** Move agent relative to current position. */
        NavigationAgent.prototype.move = function (offset, closetPoint) {
            if (closetPoint === void 0) { closetPoint = true; }
            var plugin = BABYLON.SceneManager.GetNavigationTools();
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (plugin != null && crowd != null) {
                crowd.getAgentPosition(this.m_agentIndex).addToRef(offset, this.m_agentMovement);
                if (closetPoint === true)
                    this.m_agentDestination = plugin.getClosestPoint(this.m_agentMovement);
                else
                    this.m_agentDestination = this.m_agentMovement.clone();
                if (this.m_agentIndex >= 0)
                    crowd.agentGoto(this.m_agentIndex, this.m_agentDestination);
            }
            else {
                BABYLON.Tools.Warn("No recast navigation mesh or crowd interface data available!");
            }
        };
        /** Teleport agent to destination point. */
        NavigationAgent.prototype.teleport = function (destination, closetPoint) {
            if (closetPoint === void 0) { closetPoint = true; }
            var plugin = BABYLON.SceneManager.GetNavigationTools();
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (plugin != null && crowd != null) {
                this.teleporting = true;
                if (closetPoint === true)
                    this.m_agentDestination = plugin.getClosestPoint(destination);
                else
                    this.m_agentDestination = destination.clone();
                if (this.m_agentIndex >= 0)
                    crowd.agentTeleport(this.m_agentIndex, this.m_agentDestination);
            }
            else {
                BABYLON.Tools.Warn("No recast navigation mesh or crowd interface data available!");
            }
        };
        /** Sets agent current destination point. */
        NavigationAgent.prototype.setDestination = function (destination, closetPoint) {
            if (closetPoint === void 0) { closetPoint = true; }
            var plugin = BABYLON.SceneManager.GetNavigationTools();
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (plugin != null && crowd != null) {
                if (closetPoint === true)
                    this.m_agentDestination = plugin.getClosestPoint(destination);
                else
                    this.m_agentDestination = destination.clone();
                if (this.m_agentIndex >= 0)
                    crowd.agentGoto(this.m_agentIndex, this.m_agentDestination);
            }
            else {
                BABYLON.Tools.Warn("No recast navigation mesh or crowd interface data available!");
            }
        };
        /** Gets agent current world space velocity. */
        NavigationAgent.prototype.getAgentVelocity = function () {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            return (crowd != null && this.m_agentIndex >= 0) ? crowd.getAgentVelocity(this.m_agentIndex) : null;
        };
        /** Gets agent current world space velocity. */
        NavigationAgent.prototype.getAgentVelocityToRef = function (result) {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (crowd != null && this.m_agentIndex >= 0)
                crowd.getAgentVelocityToRef(this.m_agentIndex, result);
        };
        /** Gets agent current world space position. */
        NavigationAgent.prototype.getAgentPosition = function () {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            return (crowd != null && this.m_agentIndex >= 0) ? crowd.getAgentPosition(this.m_agentIndex) : null;
        };
        /** Gets agent current world space position. */
        NavigationAgent.prototype.getAgentPositionToRef = function (result) {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (crowd != null && this.m_agentIndex >= 0)
                crowd.getAgentPositionToRef(this.m_agentIndex, result);
        };
        /** Gets agent current waypoint position. */
        NavigationAgent.prototype.getAgentWaypoint = function () {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            return (crowd != null && this.m_agentIndex >= 0) ? crowd.getAgentNextTargetPath(this.m_agentIndex) : null;
        };
        /** Gets agent current waypoint position. */
        NavigationAgent.prototype.getAgentWaypointToRef = function (result) {
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            if (crowd != null && this.m_agentIndex >= 0)
                crowd.getAgentNextTargetPathToRef(this.m_agentIndex, result);
        };
        /** Cancel current waypoint path navigation. */
        NavigationAgent.prototype.cancelNavigation = function () {
            this.m_agentDestination = null; // Note: Disable Auto Position Update
            var crowd = BABYLON.SceneManager.GetCrowdInterface(this.scene);
            var position = this.getAgentPosition();
            if (position != null && crowd != null && this.m_agentIndex >= 0) {
                crowd.agentTeleport(this.m_agentIndex, position);
                // DEPRECIATED: position.y += (this.baseOffset + this.heightOffset);
                // DEPRECIATED: this.transform.position.copyFrom(position);
            }
        };
        NavigationAgent.TARGET_ANGLE_FACTOR = (Math.PI * 0.5);
        NavigationAgent.ANGULAR_SPEED_RATIO = 0.05;
        return NavigationAgent;
    }(BABYLON.ScriptComponent));
    BABYLON.NavigationAgent = NavigationAgent;
    /**
     *  Recast Detour Crowd Agent States
     */
    var CrowdAgentState;
    (function (CrowdAgentState) {
        CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_INVALID"] = 0] = "DT_CROWDAGENT_STATE_INVALID";
        CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_WALKING"] = 1] = "DT_CROWDAGENT_STATE_WALKING";
        CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_OFFMESH"] = 2] = "DT_CROWDAGENT_STATE_OFFMESH";
    })(CrowdAgentState = BABYLON.CrowdAgentState || (BABYLON.CrowdAgentState = {}));
    ;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon raycast vehicle controller pro class (Native Bullet Physics 2.82)
     * @class RaycastVehicle - All rights reserved (c) 2020 Mackey Kinard
     */
    var RaycastVehicle = /** @class */ (function () {
        function RaycastVehicle(entity, world, center, defaultAngularFactor) {
            if (defaultAngularFactor === void 0) { defaultAngularFactor = null; }
            this._centerMass = new BABYLON.Vector3(0, 0, 0);
            this._chassisMesh = null;
            this._tempVectorPos = new BABYLON.Vector3(0, 0, 0);
            this.lockedWheelIndexes = null;
            this.m_vehicle = null;
            this.m_vehicleTuning = null;
            this.m_vehicleRaycaster = null;
            this.m_vehicleColliders = null;
            this.m_tempTransform = null;
            this.m_tempPosition = null;
            this.m_wheelDirectionCS0 = null;
            this.m_wheelAxleCS = null;
            this._chassisMesh = entity;
            this._centerMass = center;
            this.m_vehicleTuning = new Ammo.btVehicleTuning();
            this.m_vehicleRaycaster = (Ammo.btSmoothVehicleRaycaster != null) ? new Ammo.btSmoothVehicleRaycaster(world) : new Ammo.btDefaultVehicleRaycaster(world);
            this.m_vehicleColliders = (this._chassisMesh.metadata != null && this._chassisMesh.metadata.unity != null && this._chassisMesh.metadata.unity.wheels != null) ? this._chassisMesh.metadata.unity.wheels : null;
            this.m_vehicle = new Ammo.btRaycastVehicle(this.m_vehicleTuning, this._chassisMesh.physicsImpostor.physicsBody, this.m_vehicleRaycaster);
            this.m_vehicle.setCoordinateSystem(0, 1, 2); // Y-UP-AXIS
            this.m_wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0); // Y-UP-AXIS
            this.m_wheelAxleCS = new Ammo.btVector3(-1, 0, 0); // Y-UP-AXIS
            this.m_tempPosition = null;
            this.m_tempTransform = null;
            this.setupWheelInformation(defaultAngularFactor);
            world.addAction(this.m_vehicle);
        }
        RaycastVehicle.prototype.getCenterMassOffset = function () { return this._centerMass; };
        RaycastVehicle.prototype.getInternalVehicle = function () { return this.m_vehicle; };
        RaycastVehicle.prototype.getUpAxis = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getUpAxis(); };
        RaycastVehicle.prototype.getRightAxis = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getRightAxis(); };
        RaycastVehicle.prototype.getForwardAxis = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getForwardAxis(); };
        RaycastVehicle.prototype.getForwardVector = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getForwardVector(); };
        RaycastVehicle.prototype.getNumWheels = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getNumWheels(); };
        RaycastVehicle.prototype.getWheelInfo = function (wheel) { if (this.m_vehicle != null)
            return this.m_vehicle.getWheelInfo(wheel); }; // Ammo.btWheelInfo
        RaycastVehicle.prototype.resetSuspension = function () { if (this.m_vehicle != null)
            this.m_vehicle.resetSuspension(); };
        RaycastVehicle.prototype.setPitchControl = function (pitch) { if (this.m_vehicle != null)
            this.m_vehicle.setPitchControl(pitch); };
        RaycastVehicle.prototype.setEngineForce = function (power, wheel) { if (this.m_vehicle != null)
            this.m_vehicle.applyEngineForce(power, wheel); };
        RaycastVehicle.prototype.setBrakingForce = function (brake, wheel) { if (this.m_vehicle != null)
            this.m_vehicle.setBrake(brake, wheel); };
        RaycastVehicle.prototype.getWheelTransform = function (wheel) { if (this.m_vehicle != null)
            return this.m_vehicle.getWheelTransformWS(wheel); }; // Ammo.btTransform
        RaycastVehicle.prototype.updateWheelTransform = function (wheel, interpolate) { if (this.m_vehicle != null)
            this.m_vehicle.updateWheelTransform(wheel, interpolate); };
        RaycastVehicle.prototype.getUserConstraintType = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getUserConstraintType(); };
        RaycastVehicle.prototype.setUserConstraintType = function (userConstraintType) { if (this.m_vehicle != null)
            this.m_vehicle.setUserConstraintType(userConstraintType); };
        RaycastVehicle.prototype.setUserConstraintId = function (uid) { if (this.m_vehicle != null)
            this.m_vehicle.setUserConstraintId(uid); };
        RaycastVehicle.prototype.getUserConstraintId = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getUserConstraintId(); };
        RaycastVehicle.prototype.getRawCurrentSpeedKph = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getCurrentSpeedKmHour(); };
        RaycastVehicle.prototype.getRawCurrentSpeedMph = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getCurrentSpeedKmHour() * BABYLON.System.Kph2Mph; };
        RaycastVehicle.prototype.getAbsCurrentSpeedKph = function () { if (this.m_vehicle != null)
            return Math.abs(this.m_vehicle.getCurrentSpeedKmHour()); };
        RaycastVehicle.prototype.getAbsCurrentSpeedMph = function () { if (this.m_vehicle != null)
            return Math.abs(this.m_vehicle.getCurrentSpeedKmHour()) * BABYLON.System.Kph2Mph; };
        RaycastVehicle.prototype.getVehicleTuningSystem = function () { return this.m_vehicleTuning; }; // Ammo.btVehicleTuning
        RaycastVehicle.prototype.getChassisWorldTransform = function () { if (this.m_vehicle != null)
            return this.m_vehicle.getChassisWorldTransform(); }; // Ammo.btTransform
        RaycastVehicle.prototype.dispose = function () {
            this.deleteWheelInformation();
            if (this.m_vehicle != null) {
                Ammo.destroy(this.m_vehicle);
                this.m_vehicle = null;
            }
            if (this.m_vehicleTuning != null) {
                Ammo.destroy(this.m_vehicleTuning);
                this.m_vehicleTuning = null;
            }
            if (this.m_vehicleRaycaster != null) {
                Ammo.destroy(this.m_vehicleRaycaster);
                this.m_vehicleRaycaster = null;
            }
            if (this.m_wheelDirectionCS0 != null) {
                Ammo.destroy(this.m_wheelDirectionCS0);
                this.m_wheelDirectionCS0 = null;
            }
            if (this.m_wheelAxleCS != null) {
                Ammo.destroy(this.m_wheelAxleCS);
                this.m_wheelAxleCS = null;
            }
            if (this.m_tempPosition != null) {
                this.m_tempPosition = null;
            }
            if (this.m_tempTransform != null) {
                this.m_tempTransform = null;
            }
            this.m_vehicleColliders = null;
        };
        ///////////////////////////////////////////////////////
        // Static Raycast Vehicle Instance Helper Functions
        ///////////////////////////////////////////////////////
        /** Gets the rigidbody raycast vehicle controller for the entity. Note: Wheel collider metadata informaion is required for raycast vehicle control. */
        RaycastVehicle.GetInstance = function (scene, rigidbody, defaultAngularFactor) {
            if (defaultAngularFactor === void 0) { defaultAngularFactor = null; }
            var anybody = rigidbody;
            if (anybody.m_raycastVehicle == null) {
                if (rigidbody.hasWheelColliders()) {
                    var rightHanded = BABYLON.SceneManager.GetRightHanded(scene);
                    if (rightHanded === true)
                        BABYLON.Tools.Warn("Raycast vehicle not supported for right handed scene: " + anybody._abstractMesh.name);
                    anybody.m_raycastVehicle = new BABYLON.RaycastVehicle(anybody._abstractMesh, anybody.m_physicsWorld, anybody._centerOfMass, defaultAngularFactor);
                }
                else {
                    BABYLON.Tools.Warn("No wheel collider metadata found for: " + anybody._abstractMesh.name);
                }
            }
            return anybody.m_raycastVehicle;
        };
        ///////////////////////////////////////////////////////
        // Smooth Raycast Vehicle Advanced Helper Functions
        ///////////////////////////////////////////////////////
        /** Gets vehicle enable multi raycast flag using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.getEnableMultiRaycast = function () {
            var result = false;
            if (this.m_vehicle != null && this.m_vehicle.get_m_enableMultiRaycast) {
                result = this.m_vehicle.get_m_enableMultiRaycast();
            }
            return result;
        };
        /** Sets vehicle enable multi raycast flag using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.setEnableMultiRaycast = function (flag) {
            if (this.m_vehicle != null && this.m_vehicle.set_m_enableMultiRaycast) {
                this.m_vehicle.set_m_enableMultiRaycast(flag);
            }
        };
        /** Gets vehicle stable force using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.getStabilizingForce = function () {
            var result = -1;
            if (this.m_vehicle != null && this.m_vehicle.get_m_stabilizingForce) {
                result = this.m_vehicle.get_m_stabilizingForce();
            }
            return result;
        };
        /** Sets vehicle stable force using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.setStabilizingForce = function (force) {
            if (this.m_vehicle != null && this.m_vehicle.set_m_stabilizingForce) {
                this.m_vehicle.set_m_stabilizingForce(force);
            }
        };
        /** Gets vehicle max stable force using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.getMaxImpulseForce = function () {
            var result = -1;
            if (this.m_vehicle != null && this.m_vehicle.get_m_maxImpulseForce) {
                result = this.m_vehicle.get_m_maxImpulseForce();
            }
            return result;
        };
        /** Sets vehicle max stable force using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.setMaxImpulseForce = function (force) {
            if (this.m_vehicle != null && this.m_vehicle.set_m_maxImpulseForce) {
                this.m_vehicle.set_m_maxImpulseForce(force);
            }
        };
        /** Gets vehicle smooth flying impulse force using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.getSmoothFlyingImpulse = function () {
            var result = -1;
            if (this.m_vehicle != null && this.m_vehicle.get_m_smoothFlyingImpulse) {
                result = this.m_vehicle.get_m_smoothFlyingImpulse();
            }
            return result;
        };
        /** Sets vehicle smooth flying impulse using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.setSmoothFlyingImpulse = function (impulse) {
            if (this.m_vehicle != null && this.m_vehicle.set_m_smoothFlyingImpulse) {
                this.m_vehicle.set_m_smoothFlyingImpulse(impulse);
            }
        };
        /** Gets vehicle track connection accel force using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.getTrackConnectionAccel = function () {
            var result = -1;
            if (this.m_vehicle != null && this.m_vehicle.get_m_trackConnectionAccel) {
                result = this.m_vehicle.get_m_trackConnectionAccel();
            }
            return result;
        };
        /** Sets vehicle track connection accel force using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.setTrackConnectionAccel = function (force) {
            if (this.m_vehicle != null && this.m_vehicle.set_m_trackConnectionAccel) {
                this.m_vehicle.set_m_trackConnectionAccel(force);
            }
        };
        /** Gets vehicle min wheel contact count using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.getMinimumWheelContacts = function () {
            var result = -1;
            if (this.m_vehicle != null && this.m_vehicle.get_m_minimumWheelContacts) {
                result = this.m_vehicle.get_m_minimumWheelContacts();
            }
            return result;
        };
        /** Sets vehicle min wheel contact count using physics vehicle object. (Advanved Use Only) */
        RaycastVehicle.prototype.setMinimumWheelContacts = function (force) {
            if (this.m_vehicle != null && this.m_vehicle.set_m_minimumWheelContacts) {
                this.m_vehicle.set_m_minimumWheelContacts(force);
            }
        };
        /** Gets vehicle interpolate mesh normals flag using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.getInterpolateNormals = function () {
            var result = false;
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.get_m_interpolateNormals) {
                result = this.m_vehicleRaycaster.get_m_interpolateNormals();
            }
            return result;
        };
        /** Sets the vehicle interpolate mesh normals using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.setInterpolateNormals = function (flag) {
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.set_m_interpolateNormals) {
                this.m_vehicleRaycaster.set_m_interpolateNormals(flag);
            }
        };
        /** Gets vehicle shape testing mode using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.getShapeTestingMode = function () {
            var result = false;
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.get_m_shapeTestingMode) {
                result = this.m_vehicleRaycaster.get_m_shapeTestingMode();
            }
            return result;
        };
        /** Sets the vehicle shape testing mode using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.setShapeTestingMode = function (mode) {
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.set_m_shapeTestingMode) {
                this.m_vehicleRaycaster.set_m_shapeTestingMode(mode);
            }
        };
        /** Gets vehicle shape testing size using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.getShapeTestingSize = function () {
            var result = 0;
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.get_m_shapeTestingSize) {
                result = this.m_vehicleRaycaster.get_m_shapeTestingSize();
            }
            return result;
        };
        /** Sets the vehicle shape testing mode using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.setShapeTestingSize = function (size) {
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.set_m_shapeTestingSize) {
                this.m_vehicleRaycaster.set_m_shapeTestingSize(size);
            }
        };
        /** Gets vehicle shape test point count using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.getShapeTestingCount = function () {
            var result = 0;
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.get_m_testPointCount) {
                result = this.m_vehicleRaycaster.get_m_testPointCount();
            }
            return result;
        };
        /** Sets the vehicle shape test point count using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.setShapeTestingCount = function (count) {
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.set_m_testPointCount) {
                this.m_vehicleRaycaster.set_m_testPointCount(count);
            }
        };
        /** Gets vehicle sweep penetration amount using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.getSweepPenetration = function () {
            var result = 0;
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.get_m_sweepPenetration) {
                result = this.m_vehicleRaycaster.get_m_sweepPenetration();
            }
            return result;
        };
        /** Sets the vehicle sweep penetration amount using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.setSweepPenetration = function (amount) {
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.set_m_sweepPenetration) {
                this.m_vehicleRaycaster.set_m_sweepPenetration(amount);
            }
        };
        ///////////////////////////////////////////////////////
        // Smooth Raycast Vehicle Advanced Collision Functions
        ///////////////////////////////////////////////////////
        /** Gets vehicle collision group filter using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.getCollisionFilterGroup = function () {
            var result = -1;
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.get_m_collisionFilterGroup) {
                result = this.m_vehicleRaycaster.get_m_collisionFilterGroup();
            }
            return result;
        };
        /** Sets vehicle collision group filter using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.setCollisionFilterGroup = function (group) {
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.set_m_collisionFilterGroup) {
                this.m_vehicleRaycaster.set_m_collisionFilterGroup(group);
            }
        };
        /** Gets vehicle collision mask filter using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.getCollisionFilterMask = function () {
            var result = -1;
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.get_m_collisionFilterMask) {
                result = this.m_vehicleRaycaster.get_m_collisionFilterMask();
            }
            return result;
        };
        /** Sets the vehicle collision mask filter using physics raycaster object. (Advanved Use Only) */
        RaycastVehicle.prototype.setCollisionFilterMask = function (mask) {
            if (this.m_vehicleRaycaster != null && this.m_vehicleRaycaster.set_m_collisionFilterMask) {
                this.m_vehicleRaycaster.set_m_collisionFilterMask(mask);
            }
        };
        ///////////////////////////////////////////////////////
        // Raycast Vehicle Wheel Information Helper Funtions
        ///////////////////////////////////////////////////////
        /** Gets the internal wheel index by id string. */
        RaycastVehicle.prototype.getWheelIndexByID = function (id) {
            var result = -1;
            if (this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0) {
                for (var index = 0; index < this.m_vehicleColliders.length; index++) {
                    var wheel = this.m_vehicleColliders[index];
                    if (id.toLowerCase() === wheel.id.toLowerCase()) {
                        result = index;
                        break;
                    }
                }
            }
            return result;
        };
        /** Gets the internal wheel index by name string. */
        RaycastVehicle.prototype.getWheelIndexByName = function (name) {
            var result = -1;
            if (this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0) {
                for (var index = 0; index < this.m_vehicleColliders.length; index++) {
                    var wheel = this.m_vehicleColliders[index];
                    if (name.toLowerCase() === wheel.name.toLowerCase()) {
                        result = index;
                        break;
                    }
                }
            }
            return result;
        };
        /** Gets the internal wheel collider information. */
        RaycastVehicle.prototype.getWheelColliderInfo = function (wheel) {
            var result = -1;
            if (this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0 && this.m_vehicleColliders.length > wheel) {
                result = this.m_vehicleColliders[wheel];
            }
            return result;
        };
        /** Sets the internal wheel hub transform mesh by index. Used to rotate and bounce wheels. */
        RaycastVehicle.prototype.setWheelTransformMesh = function (wheel, transform) {
            if (transform == null)
                return;
            var wheelinfo = this.getWheelInfo(wheel);
            if (wheelinfo != null)
                wheelinfo.transform = transform;
        };
        ///////////////////////////////////////////////////////
        // Smooth Raycast Vehicle Seering Helper Functions
        ///////////////////////////////////////////////////////
        RaycastVehicle.prototype.getVisualSteeringAngle = function (wheel) {
            var result = 0;
            var wheelinfo = this.getWheelInfo(wheel);
            if (wheelinfo != null && wheelinfo.steeringAngle != null) {
                result = wheelinfo.steeringAngle;
            }
            return result;
        };
        RaycastVehicle.prototype.setVisualSteeringAngle = function (angle, wheel) {
            var wheelinfo = this.getWheelInfo(wheel);
            if (wheelinfo != null) {
                wheelinfo.steeringAngle = angle;
            }
        };
        RaycastVehicle.prototype.getPhysicsSteeringAngle = function (wheel) {
            if (this.m_vehicle != null) {
                return Math.abs(this.m_vehicle.getSteeringValue(wheel));
            }
        };
        RaycastVehicle.prototype.setPhysicsSteeringAngle = function (angle, wheel) {
            if (this.m_vehicle != null) {
                this.m_vehicle.setSteeringValue(angle, wheel);
            }
        };
        /////////////////////////////////////////////
        // Setup Wheel Information Helper Funtions //
        /////////////////////////////////////////////
        RaycastVehicle.prototype.setupWheelInformation = function (defaultAngularFactor) {
            if (defaultAngularFactor === void 0) { defaultAngularFactor = null; }
            if (this._chassisMesh != null && this._chassisMesh.physicsImpostor != null && this._chassisMesh.physicsImpostor.physicsBody != null) {
                if (defaultAngularFactor != null) {
                    // https://pybullet.org/Bullet/phpBB3/viewtopic.php?t=8153
                    // prevent vehicle from flip over, by limit the rotation  on forward axis or limit angles for vehicle stablization
                    if (BABYLON.RaycastVehicle.TempAmmoVector == null)
                        BABYLON.RaycastVehicle.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RaycastVehicle.TempAmmoVector.setValue(defaultAngularFactor.x, defaultAngularFactor.y, defaultAngularFactor.z);
                    this._chassisMesh.physicsImpostor.physicsBody.setAngularFactor(BABYLON.RaycastVehicle.TempAmmoVector);
                }
                this._chassisMesh.physicsImpostor.physicsBody.setActivationState(BABYLON.CollisionState.DISABLE_DEACTIVATION);
            }
            if (this.m_vehicle != null && this.m_vehicleColliders != null && this.m_vehicleColliders.length > 0) {
                var index = -1;
                for (index = 0; index < this.m_vehicleColliders.length; index++) {
                    var wheel = this.m_vehicleColliders[index];
                    var wheelName = (wheel.name != null) ? wheel.name : "Unknown";
                    var wheelRadius = (wheel.radius != null) ? wheel.radius : 0.35;
                    var wheelHalfTrack = (wheel.position != null && wheel.position.length >= 3) ? wheel.position[0] : 1;
                    var wheelAxisPosition = (wheel.position != null && wheel.position.length >= 3) ? wheel.position[2] : -1;
                    // ..
                    // Raycast Wheel Script Properties
                    // ..
                    var wheelConnectionPoint = (wheel.wheelconnectionpoint != null) ? wheel.wheelconnectionpoint : 0.5;
                    var suspensionRestLength = (wheel.suspensionrestlength != null) ? wheel.suspensionrestlength : 0.3;
                    var isfrontwheel = (wheel.frontwheel != null) ? true : (wheelName.toLowerCase().indexOf("front") >= 0);
                    var wheelposition = wheelAxisPosition;
                    var wheeltracking = wheelHalfTrack;
                    var centermassx = -this._centerMass.x;
                    var centermassz = -this._centerMass.z;
                    if (BABYLON.RaycastVehicle.TempAmmoVector == null)
                        BABYLON.RaycastVehicle.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RaycastVehicle.TempAmmoVector.setValue((wheeltracking + centermassx), wheelConnectionPoint, (wheelposition + centermassz));
                    this.m_vehicle.addWheel(BABYLON.RaycastVehicle.TempAmmoVector, this.m_wheelDirectionCS0, this.m_wheelAxleCS, suspensionRestLength, wheelRadius, this.m_vehicleTuning, isfrontwheel);
                }
                if (this.m_vehicle.getNumWheels() === this.m_vehicleColliders.length) {
                    for (index = 0; index < this.m_vehicleColliders.length; index++) {
                        var wheel = this.m_vehicleColliders[index];
                        var defaultForce = (wheel.totalsuspensionforces != null) ? wheel.totalsuspensionforces : 25000; // Bullet: 6000
                        var defaultTravel = (wheel.suspensiontravelcm != null) ? wheel.suspensiontravelcm : 100; // Bullet: 500
                        var defaultRolling = (wheel.rollinfluence != null) ? wheel.rollinfluence : 0.2; // Bullet: 0.1
                        var defaultFriction = (wheel.frictionslip != null) ? wheel.frictionslip : 10; // Bullet: 10.5
                        var suspensionStiffness = (wheel.suspensionstiffness != null) ? wheel.suspensionstiffness : 50; // Bullet: 5.88
                        var suspensionCompression = (wheel.dampingcompression != null) ? wheel.dampingcompression : 2.5; // Bullet: 0.83
                        var suspensionDamping = (wheel.dampingrelaxation != null) ? wheel.dampingrelaxation : 4.5; // Bullet: 0.88
                        var wheelinfo = this.m_vehicle.getWheelInfo(index);
                        if (wheelinfo != null) {
                            wheelinfo.steeringAngle = 0;
                            wheelinfo.rotationBoost = 0;
                            wheelinfo.defaultFriction = defaultFriction;
                            wheelinfo.set_m_frictionSlip(defaultFriction);
                            wheelinfo.set_m_rollInfluence(defaultRolling);
                            wheelinfo.set_m_maxSuspensionForce(defaultForce);
                            wheelinfo.set_m_maxSuspensionTravelCm(defaultTravel);
                            wheelinfo.set_m_suspensionStiffness(suspensionStiffness);
                            wheelinfo.set_m_wheelsDampingCompression(suspensionCompression);
                            wheelinfo.set_m_wheelsDampingRelaxation(suspensionDamping);
                        }
                    }
                }
                else {
                    BABYLON.Tools.Warn("Failed to create proper number of wheels for: " + this._chassisMesh.name);
                }
            }
        };
        RaycastVehicle.prototype.updateWheelInformation = function () {
            var wheels = this.getNumWheels();
            if (wheels > 0) {
                for (var index = 0; index < wheels; index++) {
                    var wheelinfo = this.getWheelInfo(index);
                    if (wheelinfo != null) {
                        var locked = this.lockedWheelInformation(index);
                        this.updateWheelTransform(index, false);
                        // Update Wheel Information Internals
                        this.m_tempTransform = this.getWheelTransform(index);
                        this.m_tempPosition = this.m_tempTransform.getOrigin();
                        // Sync Wheel Hub Transform To Raycast Wheel
                        if (wheelinfo.transform != null) {
                            var transform = wheelinfo.transform;
                            if (transform.parent != null) {
                                // Update Wheel Hub Position
                                BABYLON.Utilities.ConvertAmmoVector3ToRef(this.m_tempPosition, this._tempVectorPos);
                                BABYLON.Utilities.InverseTransformPointToRef(transform.parent, this._tempVectorPos, this._tempVectorPos);
                                transform.position.y = this._tempVectorPos.y;
                                // Update Wheel Hub Steering
                                var steeringAngle = (wheelinfo.steeringAngle != null) ? wheelinfo.steeringAngle : 0;
                                BABYLON.Quaternion.FromEulerAnglesToRef(0, steeringAngle, 0, transform.rotationQuaternion);
                                // Update Wheel Spinner Rotation
                                if (wheelinfo.spinner != null && wheelinfo.spinner.addRotation) {
                                    if (locked === false) {
                                        var wheelrotation = 0;
                                        var deltaRotation = (wheelinfo.get_m_deltaRotation != null) ? wheelinfo.get_m_deltaRotation() : 0;
                                        var rotationBoost = (wheelinfo.rotationBoost != null) ? wheelinfo.rotationBoost : 0;
                                        if (deltaRotation < 0)
                                            wheelrotation = (deltaRotation + -rotationBoost);
                                        else
                                            wheelrotation = (deltaRotation + rotationBoost);
                                        wheelinfo.spinner.addRotation(wheelrotation, 0, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        RaycastVehicle.prototype.lockedWheelInformation = function (wheel) {
            var result = false;
            if (this.lockedWheelIndexes != null && this.lockedWheelIndexes.length > 0) {
                for (var index = 0; index < this.lockedWheelIndexes.length; index++) {
                    if (this.lockedWheelIndexes[index] === wheel) {
                        result = true;
                        break;
                    }
                }
            }
            return result;
        };
        RaycastVehicle.prototype.deleteWheelInformation = function () {
            var wheels = this.getNumWheels();
            if (wheels > 0) {
                for (var index = 0; index < wheels; index++) {
                    var info = this.getWheelInfo(index);
                    if (info != null) {
                        if (info.transform != null) {
                            delete info.transform;
                        }
                        if (info.spinner != null) {
                            delete info.spinner;
                        }
                        if (info.steeringAngle != null) {
                            delete info.steeringAngle;
                        }
                        if (info.rotationBoost != null) {
                            delete info.rotationBoost;
                        }
                        if (info.defaultFriction != null) {
                            delete info.defaultFriction;
                        }
                    }
                }
            }
        };
        RaycastVehicle.TempAmmoVector = null;
        return RaycastVehicle;
    }());
    BABYLON.RaycastVehicle = RaycastVehicle;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon realtime reflection system pro class (Unity Style Realtime Reflection Probes)
     * @class RealtimeReflection - All rights reserved (c) 2020 Mackey Kinard
     */
    var RealtimeReflection = /** @class */ (function (_super) {
        __extends(RealtimeReflection, _super);
        function RealtimeReflection() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.renderList = null;
            _this.probeList = null;
            _this.refreshMode = 0;
            _this.cullingMask = 0;
            _this.clearFlags = 0;
            _this.probeid = 0;
            _this.useProbeList = false;
            _this.includeChildren = false;
            _this.resolution = 128;
            _this.boxPos = null;
            _this.boxSize = null;
            _this.boxProjection = false;
            return _this;
        }
        RealtimeReflection.prototype.getProbeList = function () { return this.probeList; };
        RealtimeReflection.prototype.getRenderList = function () { return this.renderList; };
        RealtimeReflection.prototype.awake = function () { this.awakeRealtimReflections(); };
        RealtimeReflection.prototype.start = function () { this.startRealtimReflections(); };
        RealtimeReflection.prototype.destroy = function () { this.destroyRealtimReflections(); };
        RealtimeReflection.prototype.awakeRealtimReflections = function () {
            this.probeid = this.getProperty("id", this.probeid);
            this.resolution = this.getProperty("resolution", this.resolution);
            this.cullingMask = this.getProperty("culling", this.cullingMask);
            this.clearFlags = this.getProperty("clearflags", this.clearFlags);
            this.refreshMode = this.getProperty("refreshmode", this.refreshMode);
            this.useProbeList = this.getProperty("useprobelist", this.useProbeList);
            this.includeChildren = this.getProperty("includechildren", this.includeChildren);
            this.boxProjection = this.getProperty("boxprojection", this.boxProjection);
            if (this.boxProjection === true) {
                var bbp = this.getProperty("boundingboxposition");
                if (bbp != null && bbp.length >= 3) {
                    this.boxPos = new BABYLON.Vector3(bbp[0], bbp[1], bbp[2]);
                }
                var bbz = this.getProperty("boundingboxsize");
                if (bbz != null && bbz.length >= 3) {
                    this.boxSize = new BABYLON.Vector3(bbz[0], bbz[1], bbz[2]);
                }
            }
        };
        RealtimeReflection.prototype.startRealtimReflections = function () {
            var _a;
            var index = 0;
            var quality = BABYLON.SceneManager.GetRenderQuality();
            var allowReflections = (quality === BABYLON.RenderQuality.High);
            if (allowReflections === true) {
                if (this.cullingMask === 0) { // Nothing
                    if (this.clearFlags === BABYLON.RealtimeReflection.SKYBOX_FLAG) {
                        var skybox = BABYLON.SceneManager.GetAmbientSkybox(this.scene);
                        if (skybox != null) {
                            if (this.renderList == null)
                                this.renderList = [];
                            this.renderList.push(skybox);
                        }
                    }
                }
                else if (this.cullingMask === -1) { // Everything
                    for (index = 0; index < this.scene.meshes.length; index++) {
                        var render = false;
                        var mesh = this.scene.meshes[index];
                        if (mesh != null) {
                            if (mesh.id === "Ambient Skybox") {
                                render = (this.clearFlags === BABYLON.RealtimeReflection.SKYBOX_FLAG);
                            }
                            else {
                                render = true;
                            }
                            if (render === true) {
                                if (this.renderList == null)
                                    this.renderList = [];
                                this.renderList.push(mesh);
                            }
                        }
                    }
                }
                else { // Parse Render List Meta Data
                    var renderListData = this.getProperty("renderlist");
                    if (renderListData != null && renderListData.length > 0) {
                        var _loop_2 = function () {
                            var renderId = renderListData[index];
                            var renderMesh = BABYLON.SceneManager.GetMeshByID(this_2.scene, renderId);
                            if (renderMesh != null) {
                                if (this_2.renderList == null)
                                    this_2.renderList = [];
                                var detailName_1 = renderMesh.name + ".Detail";
                                var detailChildren = renderMesh.getChildren(function (node) { return (node.name === detailName_1); }, true);
                                if (detailChildren != null && detailChildren.length > 0) {
                                    this_2.renderList.push(detailChildren[0]);
                                }
                                else {
                                    this_2.renderList.push(renderMesh);
                                }
                            }
                        };
                        var this_2 = this;
                        for (index = 0; index < renderListData.length; index++) {
                            _loop_2();
                        }
                    }
                    if (this.clearFlags === BABYLON.RealtimeReflection.SKYBOX_FLAG) {
                        var skybox = BABYLON.SceneManager.GetAmbientSkybox(this.scene);
                        if (skybox != null) {
                            if (this.renderList == null)
                                this.renderList = [];
                            this.renderList.push(skybox);
                        }
                    }
                }
                // ..
                // Get Probe Render List
                // ..
                if (this.useProbeList === true) {
                    var probeListData = this.getProperty("probelist");
                    if (probeListData != null && probeListData.length > 0) {
                        for (index = 0; index < probeListData.length; index++) {
                            var probeId = probeListData[index];
                            var probeMesh = BABYLON.SceneManager.GetMeshByID(this.scene, probeId);
                            if (probeMesh != null) {
                                if (this.probeList == null)
                                    this.probeList = [];
                                this.probeList.push(probeMesh);
                                if (this.includeChildren === true) {
                                    var childMeshes = probeMesh.getChildMeshes(false);
                                    for (var ii = 0; ii < childMeshes.length; ii++) {
                                        var childMesh = childMeshes[ii];
                                        this.probeList.push(childMesh);
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    var probeTag = "PROBE_" + this.probeid.toFixed(0);
                    this.probeList = this.scene.getMeshesByTags(probeTag);
                }
                if (this.probeList != null && this.probeList.length > 0) {
                    var abstractMesh = this.getAbstractMesh();
                    for (index = 0; index < this.probeList.length; index++) {
                        var probemesh = this.probeList[index];
                        var reflectionProbe = new BABYLON.ReflectionProbe(probemesh.name + ".Probe", this.resolution, this.scene);
                        reflectionProbe.refreshRate = (this.refreshMode === 0) ? BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE : BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME;
                        (_a = reflectionProbe.renderList).push.apply(_a, this.renderList);
                        if (abstractMesh != null)
                            reflectionProbe.attachToMesh(abstractMesh);
                        if (this.boxProjection === true) {
                            if (this.boxSize != null) {
                                reflectionProbe.cubeTexture.boundingBoxSize = this.boxSize;
                            }
                            if (this.boxPos != null) {
                                reflectionProbe.cubeTexture.boundingBoxPosition = this.boxPos;
                            }
                        }
                        if (probemesh.material instanceof BABYLON.MultiMaterial) {
                            var mmat1 = probemesh.material.clone(probemesh.material.name + "." + probemesh.name);
                            for (var xx = 0; xx < mmat1.subMaterials.length; xx++) {
                                var smat1 = mmat1.subMaterials[xx];
                                var subMaterial = mmat1.subMaterials[xx].clone(mmat1.subMaterials[xx].name + "_" + probemesh.name);
                                subMaterial.unfreeze();
                                subMaterial.reflectionTexture = reflectionProbe.cubeTexture;
                                mmat1.subMaterials[xx] = subMaterial;
                            }
                            probemesh.material = mmat1;
                        }
                        else {
                            var meshMaterial = probemesh.material.clone(probemesh.material.name + "." + probemesh.name);
                            meshMaterial.unfreeze();
                            meshMaterial.reflectionTexture = reflectionProbe.cubeTexture;
                            probemesh.material = meshMaterial;
                        }
                    }
                }
            }
        };
        RealtimeReflection.prototype.destroyRealtimReflections = function () {
            this.probeList = null;
            this.renderList = null;
        };
        RealtimeReflection.SKYBOX_FLAG = 1;
        return RealtimeReflection;
    }(BABYLON.ScriptComponent));
    BABYLON.RealtimeReflection = RealtimeReflection;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon full rigidbody physics pro class (Native Bullet Physics 2.82)
     * @class RigidbodyPhysics - All rights reserved (c) 2020 Mackey Kinard
     */
    var RigidbodyPhysics = /** @class */ (function (_super) {
        __extends(RigidbodyPhysics, _super);
        function RigidbodyPhysics() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._abstractMesh = null;
            _this._isKinematic = false;
            _this._maxCollisions = 4;
            _this._isPhysicsReady = false;
            _this._collisionObject = null;
            _this._centerOfMass = new BABYLON.Vector3(0, 0, 0);
            _this._tmpLinearFactor = new BABYLON.Vector3(0, 0, 0);
            _this._tmpAngularFactor = new BABYLON.Vector3(0, 0, 0);
            _this._tmpCenterOfMass = new BABYLON.Vector3(0, 0, 0);
            _this._tmpCollisionContacts = null;
            /** Register handler that is triggered when the a collision contact has entered */
            _this.onCollisionEnterObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the a collision contact is active */
            _this.onCollisionStayObservable = new BABYLON.Observable();
            /** Register handler that is triggered when the a collision contact has exited */
            _this.onCollisionExitObservable = new BABYLON.Observable();
            _this.m_physicsWorld = null;
            _this.m_physicsEngine = null;
            _this.m_raycastVehicle = null;
            return _this;
        }
        Object.defineProperty(RigidbodyPhysics.prototype, "isKinematic", {
            get: function () { return this._isKinematic; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(RigidbodyPhysics.prototype, "centerOfMass", {
            get: function () { return this._centerOfMass; },
            enumerable: false,
            configurable: true
        });
        RigidbodyPhysics.prototype.awake = function () { this.awakeRigidbodyState(); };
        RigidbodyPhysics.prototype.update = function () { this.updateRigidbodyState(); };
        RigidbodyPhysics.prototype.after = function () { this.afterRigidbodyState(); };
        RigidbodyPhysics.prototype.destroy = function () { this.destroyRigidbodyState(); };
        /////////////////////////////////////////////////
        // Protected Rigidbody Physics State Functions //
        /////////////////////////////////////////////////
        RigidbodyPhysics.prototype.awakeRigidbodyState = function () {
            this._abstractMesh = this.getAbstractMesh();
            this._isKinematic = this.getProperty("isKinematic", this._isKinematic);
            this.m_physicsWorld = BABYLON.SceneManager.GetPhysicsWorld(this.scene);
            this.m_physicsEngine = BABYLON.SceneManager.GetPhysicsEngine(this.scene);
            if (this.transform.metadata != null && this.transform.metadata.unity != null && this.transform.metadata.unity.physics != null) {
                this._centerOfMass = (this.transform.metadata.unity.physics.center != null) ? BABYLON.Utilities.ParseVector3(this.transform.metadata.unity.physics.center, this._centerOfMass) : this._centerOfMass;
            }
            //console.warn("Starting Rigidbody Physics For: " + this.transform.name);
            this.setMaxNotifications(this._maxCollisions);
            BABYLON.Utilities.ValidateTransformQuaternion(this.transform);
            this._isPhysicsReady = (this.m_physicsEngine != null && this._tmpCollisionContacts != null && this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null);
            var collisionGroup = (this._isKinematic === true) ? BABYLON.CollisionFilters.StaticFilter : BABYLON.CollisionFilters.DefaultFilter;
            var collisionMask = (this._isKinematic === true) ? BABYLON.CollisionFilters.AllFilter ^ BABYLON.CollisionFilters.StaticFilter : BABYLON.CollisionFilters.AllFilter;
            this.setCollisionFilterGroup(collisionGroup);
            this.setCollisionFilterMask(collisionMask);
            this.resetBodyCollisionContacts();
        };
        RigidbodyPhysics.prototype.updateRigidbodyState = function () {
            this.syncronizeVehicleController();
        };
        RigidbodyPhysics.prototype.afterRigidbodyState = function () {
            this.parseBodyCollisionContacts();
            this.resetBodyCollisionContacts();
        };
        RigidbodyPhysics.prototype.destroyRigidbodyState = function () {
            this.m_physicsWorld = null;
            this.m_physicsEngine = null;
            if (this.m_raycastVehicle != null) {
                if (this.m_raycastVehicle.dispose) {
                    this.m_raycastVehicle.dispose();
                }
                this.m_raycastVehicle = null;
            }
            this.onCollisionEnterObservable.clear();
            this.onCollisionEnterObservable = null;
            this.onCollisionStayObservable.clear();
            this.onCollisionStayObservable = null;
            this.onCollisionExitObservable.clear();
            this.onCollisionExitObservable = null;
            this._tmpCollisionContacts = null;
            this._collisionObject = null;
            this._abstractMesh = null;
        };
        //////////////////////////////////////////////////
        // Rigidbody Physics Life Cycle Event Functions //
        //////////////////////////////////////////////////
        RigidbodyPhysics.prototype.syncronizeVehicleController = function () {
            if (this.m_raycastVehicle != null) {
                if (this.m_raycastVehicle.updateWheelInformation) {
                    this.m_raycastVehicle.updateWheelInformation();
                }
            }
        };
        RigidbodyPhysics.prototype.parseBodyCollisionContacts = function () {
            if (this._isPhysicsReady === true) {
                var hasEnterObservers = this.onCollisionEnterObservable.hasObservers();
                var hasStayObservers = this.onCollisionStayObservable.hasObservers();
                var hasExitObservers = this.onCollisionExitObservable.hasObservers();
                if (hasEnterObservers || hasStayObservers || hasExitObservers) {
                    var index = 0; // Note: Flag All Collision List Items For End Contact State
                    for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                        this._tmpCollisionContacts[index].reset = true;
                    }
                    // ..
                    // Parse Overlapping Body Contact Objects
                    // ..
                    var collisionCount = 0;
                    if (this._abstractMesh.physicsImpostor.tmpCollisionObjects != null) {
                        var tmpCollisionObjectMap = this._abstractMesh.physicsImpostor.tmpCollisionObjects;
                        for (var contactKey in tmpCollisionObjectMap) {
                            var foundindex = -1;
                            var contactMesh = tmpCollisionObjectMap[contactKey];
                            for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                                var check = this._tmpCollisionContacts[index];
                                if (check.mesh != null && check.mesh === contactMesh) {
                                    check.state = 1;
                                    check.reset = false;
                                    foundindex = index;
                                    break;
                                }
                            }
                            if (foundindex === -1) {
                                for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                                    var insert = this._tmpCollisionContacts[index];
                                    if (insert.mesh == null) {
                                        insert.mesh = contactMesh;
                                        insert.state = 0;
                                        insert.reset = false;
                                        break;
                                    }
                                }
                            }
                            collisionCount++;
                            if (collisionCount > this._maxCollisions)
                                break;
                        }
                    }
                    // ..
                    // Dispatch Body Collision Contact State
                    // ..
                    for (index = 0; index < this._tmpCollisionContacts.length; index++) {
                        var info = this._tmpCollisionContacts[index];
                        if (info.reset === true) {
                            // Dispatch On Collision Exit Event
                            if (hasExitObservers && info.mesh != null) {
                                this.onCollisionExitObservable.notifyObservers(info.mesh);
                            }
                            // Reset Collision Contact Info Item
                            info.mesh = null;
                            info.state = 0;
                            info.reset = false;
                        }
                        else {
                            if (info.state === 0) {
                                // Dispatch On Collision Enter Event
                                if (hasEnterObservers && info.mesh != null) {
                                    this.onCollisionEnterObservable.notifyObservers(info.mesh);
                                }
                            }
                            else {
                                // Dispatch On Collision Stay Event
                                if (hasStayObservers && info.mesh != null) {
                                    this.onCollisionStayObservable.notifyObservers(info.mesh);
                                }
                            }
                        }
                    }
                }
            }
        };
        RigidbodyPhysics.prototype.resetBodyCollisionContacts = function () {
            if (this._isPhysicsReady === true) {
                var hasEnterObservers = this.onCollisionEnterObservable.hasObservers();
                var hasStayObservers = this.onCollisionStayObservable.hasObservers();
                var hasExitObservers = this.onCollisionExitObservable.hasObservers();
                if (hasEnterObservers || hasStayObservers || hasExitObservers) {
                    this._abstractMesh.physicsImpostor.tmpCollisionObjects = {};
                }
                else {
                    this._abstractMesh.physicsImpostor.tmpCollisionObjects = null;
                }
            }
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Rigidbody Physics Gravity Advanced Helper Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Sets entity gravity value using physics impostor body. */
        RigidbodyPhysics.prototype.setGravity = function (gravity) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.setGravity) {
                if (gravity != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(gravity.x, gravity.y, gravity.z);
                    this._abstractMesh.physicsImpostor.physicsBody.setGravity(BABYLON.RigidbodyPhysics.TempAmmoVector);
                }
            }
        };
        /** Gets entity gravity value using physics impostor body. */
        RigidbodyPhysics.prototype.getGravity = function () {
            var result = new BABYLON.Vector3(0, 0, 0);
            this.getGravityToRef(result);
            return result;
        };
        /** Gets entity gravity value using physics impostor body. */
        RigidbodyPhysics.prototype.getGravityToRef = function (result) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getGravity) {
                var gravity = this._abstractMesh.physicsImpostor.physicsBody.getGravity();
                BABYLON.Utilities.ConvertAmmoVector3ToRef(gravity, result);
            }
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Rigidbody Physics Impostor Helper Functions -  TODO - Use Native Physics API - ???
        ////////////////////////////////////////////////////////////////////////////////////
        /** Gets mass of entity using physics impostor. */
        RigidbodyPhysics.prototype.getMass = function () {
            var result = 0;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                result = this._abstractMesh.physicsImpostor.mass;
            }
            return result;
        };
        /** Sets mass to entity using physics impostor. */
        RigidbodyPhysics.prototype.setMass = function (mass) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                if (this._abstractMesh.physicsImpostor.mass !== mass) {
                    this._abstractMesh.physicsImpostor.mass = mass;
                }
            }
        };
        /** Gets entity friction level using physics impostor. */
        RigidbodyPhysics.prototype.getFriction = function () {
            var result = 0;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                result = this._abstractMesh.physicsImpostor.friction;
            }
            return result;
        };
        /** Applies friction to entity using physics impostor. */
        RigidbodyPhysics.prototype.setFriction = function (friction) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                if (this._abstractMesh.physicsImpostor.friction !== friction) {
                    this._abstractMesh.physicsImpostor.friction = friction;
                }
            }
        };
        /** Gets restitution of entity using physics impostor. */
        RigidbodyPhysics.prototype.getRestitution = function () {
            var result = 0;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                result = this._abstractMesh.physicsImpostor.restitution;
            }
            return result;
        };
        /** Sets restitution to entity using physics impostor. */
        RigidbodyPhysics.prototype.setRestitution = function (restitution) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                if (this._abstractMesh.physicsImpostor.restitution !== restitution) {
                    this._abstractMesh.physicsImpostor.restitution = restitution;
                }
            }
        };
        /** Gets entity linear velocity using physics impostor. */
        RigidbodyPhysics.prototype.getLinearVelocity = function () {
            var result = null;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                result = this._abstractMesh.physicsImpostor.getLinearVelocity();
            }
            return result;
        };
        /** Sets entity linear velocity using physics impostor. */
        RigidbodyPhysics.prototype.setLinearVelocity = function (velocity) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                if (velocity != null)
                    this._abstractMesh.physicsImpostor.setLinearVelocity(velocity);
            }
        };
        /** Gets entity angular velocity using physics impostor. */
        RigidbodyPhysics.prototype.getAngularVelocity = function () {
            var result = null;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                result = this._abstractMesh.physicsImpostor.getAngularVelocity();
            }
            return result;
        };
        /** Sets entity angular velocity using physics impostor. */
        RigidbodyPhysics.prototype.setAngularVelocity = function (velocity) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null) {
                if (velocity != null)
                    this._abstractMesh.physicsImpostor.setAngularVelocity(velocity);
            }
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Rigidbody Physics Transform Helper Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Gets the native physics world transform object using physics impostor body. (Ammo.btTransform) */
        RigidbodyPhysics.prototype.getWorldTransform = function () {
            var result = null;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null)
                    this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null && this._collisionObject.getWorldTransform) {
                    result = this._collisionObject.getWorldTransform();
                }
            }
            return result;
        };
        /** sets the native physics world transform object using physics impostor body. (Ammo.btTransform) */
        RigidbodyPhysics.prototype.setWorldTransform = function (btTransform) {
            var result = null;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null)
                    this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null && this._collisionObject.setWorldTransform) {
                    this._collisionObject.setWorldTransform(btTransform);
                }
                if (this._abstractMesh.physicsImpostor.mass === 0 && this._abstractMesh.physicsImpostor.physicsBody.getMotionState) {
                    var motionState = this._abstractMesh.physicsImpostor.physicsBody.getMotionState();
                    if (motionState != null && motionState.setWorldTransform) {
                        motionState.setWorldTransform(btTransform);
                    }
                }
            }
            return result;
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Rigidbody Applied Physics Movement Functions
        ////////////////////////////////////////////////////////////////////////////////////
        RigidbodyPhysics.prototype.clearForces = function () {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.clearForces) {
                this._abstractMesh.physicsImpostor.physicsBody.clearForces();
            }
        };
        ////////////////////////////////////////////////// 
        // TODO - Use Function Specific Temp Ammo Buffer //
        ////////////////////////////////////////////////// 
        RigidbodyPhysics.prototype.applyTorque = function (torque) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyTorque) {
                if (torque != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(torque.x, torque.y, torque.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyTorque(BABYLON.RigidbodyPhysics.TempAmmoVector);
                }
            }
        };
        RigidbodyPhysics.prototype.applyLocalTorque = function (torque) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyLocalTorque) {
                if (torque != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(torque.x, torque.y, torque.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyLocalTorque(BABYLON.RigidbodyPhysics.TempAmmoVector);
                }
            }
        };
        RigidbodyPhysics.prototype.applyImpulse = function (impulse, rel_pos) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyImpulse) {
                if (impulse != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    if (BABYLON.RigidbodyPhysics.TempAmmoVectorAux == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVectorAux = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(impulse.x, impulse.y, impulse.z);
                    BABYLON.RigidbodyPhysics.TempAmmoVectorAux.setValue(rel_pos.x, rel_pos.y, rel_pos.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyImpulse(BABYLON.RigidbodyPhysics.TempAmmoVector, BABYLON.RigidbodyPhysics.TempAmmoVectorAux);
                }
            }
        };
        RigidbodyPhysics.prototype.applyCentralImpulse = function (impulse) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyCentralImpulse) {
                if (impulse != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(impulse.x, impulse.y, impulse.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyCentralImpulse(BABYLON.RigidbodyPhysics.TempAmmoVector);
                }
            }
        };
        RigidbodyPhysics.prototype.applyTorqueImpulse = function (torque) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyTorqueImpulse) {
                if (torque != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(torque.x, torque.y, torque.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyTorqueImpulse(BABYLON.RigidbodyPhysics.TempAmmoVector);
                }
            }
        };
        RigidbodyPhysics.prototype.applyForce = function (force, rel_pos) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyForce) {
                if (force != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    if (BABYLON.RigidbodyPhysics.TempAmmoVectorAux == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVectorAux = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(force.x, force.y, force.z);
                    BABYLON.RigidbodyPhysics.TempAmmoVectorAux.setValue(rel_pos.x, rel_pos.y, rel_pos.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyForce(BABYLON.RigidbodyPhysics.TempAmmoVector, BABYLON.RigidbodyPhysics.TempAmmoVectorAux);
                }
            }
        };
        RigidbodyPhysics.prototype.applyCentralForce = function (force) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyCentralForce) {
                if (force != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(force.x, force.y, force.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyCentralForce(BABYLON.RigidbodyPhysics.TempAmmoVector);
                }
            }
        };
        RigidbodyPhysics.prototype.applyCentralLocalForce = function (force) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.applyCentralLocalForce) {
                if (force != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(force.x, force.y, force.z);
                    this._abstractMesh.physicsImpostor.physicsBody.applyCentralLocalForce(BABYLON.RigidbodyPhysics.TempAmmoVector);
                }
            }
        };
        /** gets rigidbody center of mass */
        RigidbodyPhysics.prototype.getCenterOfMassTransform = function () {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getCenterOfMassTransform) {
                var bttransform = this._abstractMesh.physicsImpostor.physicsBody.getCenterOfMassTransform();
                var btposition = bttransform.getOrigin();
                this._tmpCenterOfMass.set(btposition.x(), btposition.y(), btposition.z());
            }
            return this._tmpCenterOfMass;
        };
        /** Sets rigidbody center of mass */
        RigidbodyPhysics.prototype.setCenterOfMassTransform = function (center) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.setCenterOfMassTransform) {
                if (center != null) {
                    if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                        BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                    BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(center.x, center.y, center.z);
                    if (BABYLON.RigidbodyPhysics.TempCenterTransform == null)
                        BABYLON.RigidbodyPhysics.TempCenterTransform = new Ammo.btTransform();
                    BABYLON.RigidbodyPhysics.TempCenterTransform.setIdentity();
                    BABYLON.RigidbodyPhysics.TempCenterTransform.setOrigin(BABYLON.RigidbodyPhysics.TempAmmoVector);
                    this._abstractMesh.physicsImpostor.physicsBody.setCenterOfMassTransform(BABYLON.RigidbodyPhysics.TempCenterTransform);
                }
            }
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Rigidbody Physics Native Body Helper Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Gets entity linear factor using physics impostor body. */
        RigidbodyPhysics.prototype.getLinearFactor = function () {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getLinearFactor) {
                var linearFactor = this._abstractMesh.physicsImpostor.physicsBody.getLinearFactor();
                this._tmpLinearFactor.set(linearFactor.x(), linearFactor.y(), linearFactor.z());
            }
            return this._tmpLinearFactor;
        };
        /** Sets entity linear factor using physics impostor body. */
        RigidbodyPhysics.prototype.setLinearFactor = function (factor) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.setLinearFactor) {
                if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                    BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(factor.x, factor.y, factor.z);
                this._abstractMesh.physicsImpostor.physicsBody.setLinearFactor(BABYLON.RigidbodyPhysics.TempAmmoVector);
            }
        };
        /** Gets entity angular factor using physics impostor body. */
        RigidbodyPhysics.prototype.getAngularFactor = function () {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getAngularFactor) {
                var angularFactor = this._abstractMesh.physicsImpostor.physicsBody.getAngularFactor();
                this._tmpAngularFactor.set(angularFactor.x(), angularFactor.y(), angularFactor.z());
            }
            return this._tmpAngularFactor;
        };
        /** Sets entity angular factor using physics impostor body. */
        RigidbodyPhysics.prototype.setAngularFactor = function (factor) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.setAngularFactor) {
                if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                    BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(factor.x, factor.y, factor.z);
                this._abstractMesh.physicsImpostor.physicsBody.setAngularFactor(BABYLON.RigidbodyPhysics.TempAmmoVector);
            }
        };
        /** Gets entity angular damping using physics impostor body. */
        RigidbodyPhysics.prototype.getAngularDamping = function () {
            var result = 0;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getAngularDamping) {
                result = this._abstractMesh.physicsImpostor.physicsBody.getAngularDamping();
            }
            return result;
        };
        /** Gets entity linear damping using physics impostor body. */
        RigidbodyPhysics.prototype.getLinearDamping = function () {
            var result = 0;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getLinearDamping) {
                result = this._abstractMesh.physicsImpostor.physicsBody.getLinearDamping();
            }
            return result;
        };
        /** Sets entity drag damping using physics impostor body. */
        RigidbodyPhysics.prototype.setDamping = function (linear, angular) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.setDamping) {
                this._abstractMesh.physicsImpostor.physicsBody.setDamping(linear, angular);
            }
        };
        /** Sets entity sleeping threshold using physics impostor body. */
        RigidbodyPhysics.prototype.setSleepingThresholds = function (linear, angular) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.setSleepingThresholds) {
                this._abstractMesh.physicsImpostor.physicsBody.setSleepingThresholds(linear, angular);
            }
        };
        ////////////////////////////////////////////////////////////////////////////////////
        // Rigidbody Physics Native Advanced Helper Functions
        ////////////////////////////////////////////////////////////////////////////////////
        /** Checks if rigidbody has wheel collider metadata for the entity. Note: Wheel collider metadata informaion is required for vehicle control. */
        RigidbodyPhysics.prototype.hasWheelColliders = function () {
            return (this._isPhysicsReady === true && this._abstractMesh.metadata != null && this._abstractMesh.metadata.unity != null && this._abstractMesh.metadata.unity.wheels != null);
        };
        /** Sets the maximum number of simultaneous contact notfications to dispatch per frame. Defaults value is 4. (Advanved Use Only) */
        RigidbodyPhysics.prototype.setMaxNotifications = function (max) {
            this._maxCollisions = max;
            this._tmpCollisionContacts = [];
            for (var index = 0; index < this._maxCollisions; index++) {
                this._tmpCollisionContacts.push(new CollisionContactInfo());
            }
        };
        /** Sets entity collision activation state using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.setActivationState = function (state) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null)
                    this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null && this._collisionObject.setActivationState) {
                    this._collisionObject.setActivationState(state);
                }
            }
        };
        /** Gets entity collision filter group using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.getCollisionFilterGroup = function () {
            var result = -1;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy) {
                result = this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy().get_m_collisionFilterGroup();
            }
            return result;
        };
        /** Sets entity collision filter group using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.setCollisionFilterGroup = function (group) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy) {
                this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy().set_m_collisionFilterGroup(group);
            }
        };
        /** Gets entity collision filter mask using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.getCollisionFilterMask = function () {
            var result = -1;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy) {
                result = this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy().get_m_collisionFilterMask();
            }
            return result;
        };
        /** Sets entity collision filter mask using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.setCollisionFilterMask = function (mask) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null && this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy) {
                this._abstractMesh.physicsImpostor.physicsBody.getBroadphaseProxy().set_m_collisionFilterMask(mask);
            }
        };
        /** Gets the entity collision shape type using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.getCollisionShapeType = function () {
            var result = -1;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null)
                    this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null) {
                    var collisionShape = this._collisionObject.getCollisionShape();
                    if (collisionShape != null && collisionShape.getShapeType) {
                        result = collisionShape.getShapeType();
                    }
                }
            }
            return result;
        };
        /** Gets the entity collision shape margin using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.getCollisionShapeMargin = function () {
            var result = -1;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null)
                    this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null) {
                    var collisionShape = this._collisionObject.getCollisionShape();
                    if (collisionShape != null && collisionShape.getMargin) {
                        result = collisionShape.getMargin();
                    }
                }
            }
            return result;
        };
        /** Sets entity collision shape margin using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.setCollisionShapeMargin = function (margin) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null)
                    this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null) {
                    var collisionShape = this._collisionObject.getCollisionShape();
                    if (collisionShape != null && collisionShape.setMargin) {
                        collisionShape.setMargin(margin);
                    }
                }
            }
        };
        /** Gets the entity contact processing threshold using physics impostor body. (Advanved Use Only) */
        /* DEPRECIATED: TODO - Must Expose This Function In Ammo.idl
        public getContactProcessingThreshold():number {
            let result:number = -1;
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null) this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null && this._collisionObject.getContactProcessingThreshold) {
                    result = this._collisionObject.getContactProcessingThreshold();
                }
            }
            return result;
        }*/
        /** Sets entity contact processing threshold using physics impostor body. (Advanved Use Only) */
        RigidbodyPhysics.prototype.setContactProcessingThreshold = function (threshold) {
            if (this._abstractMesh != null && this._abstractMesh.physicsImpostor != null && this._abstractMesh.physicsImpostor.physicsBody != null) {
                if (this._collisionObject == null)
                    this._collisionObject = Ammo.castObject(this._abstractMesh.physicsImpostor.physicsBody, Ammo.btCollisionObject);
                if (this._collisionObject != null && this._collisionObject.setContactProcessingThreshold) {
                    this._collisionObject.setContactProcessingThreshold(threshold);
                }
            }
        };
        // ************************************ //
        // * Physics Physics Helper Functions * //
        // ************************************ //
        /** TODO */
        RigidbodyPhysics.CreatePhysicsMetadata = function (mass, drag, angularDrag, centerMass) {
            if (drag === void 0) { drag = 0.0; }
            if (angularDrag === void 0) { angularDrag = 0.05; }
            if (centerMass === void 0) { centerMass = null; }
            var center = (centerMass != null) ? centerMass : new BABYLON.Vector3(0, 0, 0);
            return {
                "type": "rigidbody",
                "mass": mass,
                "ldrag": drag,
                "adrag": angularDrag,
                "center": {
                    "x": center.x,
                    "y": center.y,
                    "z": center.z
                }
            };
        };
        /** TODO */
        RigidbodyPhysics.CreateCollisionMetadata = function (type, trigger, convexmesh, restitution, dynamicfriction, staticfriction) {
            if (trigger === void 0) { trigger = false; }
            if (convexmesh === void 0) { convexmesh = false; }
            if (restitution === void 0) { restitution = 0.0; }
            if (dynamicfriction === void 0) { dynamicfriction = 0.6; }
            if (staticfriction === void 0) { staticfriction = 0.6; }
            return {
                "type": type,
                "trigger": trigger,
                "convexmesh": convexmesh,
                "restitution": restitution,
                "dynamicfriction": dynamicfriction,
                "staticfriction": staticfriction,
                "wheelinformation": null
            };
        };
        /** TODO */
        RigidbodyPhysics.CreatePhysicsProperties = function (mass, drag, angularDrag, useGravity, isKinematic) {
            if (drag === void 0) { drag = 0.0; }
            if (angularDrag === void 0) { angularDrag = 0.05; }
            if (useGravity === void 0) { useGravity = true; }
            if (isKinematic === void 0) { isKinematic = false; }
            return {
                "mass": mass,
                "drag": drag,
                "angularDrag": angularDrag,
                "useGravity": useGravity,
                "isKinematic": isKinematic
            };
        };
        /** TODO */
        RigidbodyPhysics.SetupPhysicsComponent = function (scene, entity) {
            // console.warn("Setup Physics Component: " + entity.name);
            // console.log(entity);
            var metadata = (entity.metadata != null && entity.metadata.unity != null) ? entity.metadata.unity : null;
            if (metadata != null && (metadata.physics != null || metadata.collision != null)) {
                // Physics Metadata
                var hasphysics = (metadata.physics != null);
                var isroot = (metadata.physics != null && metadata.physics.root != null) ? metadata.physics.root : false;
                var mass = (metadata.physics != null && metadata.physics.mass != null) ? metadata.physics.mass : 0;
                var isstatic = (mass === 0);
                // Create Physics Impostor Node
                if (hasphysics === true) {
                    if (isroot) {
                        var fwheels_1 = null;
                        var fdynamicfriction_1 = 0;
                        var fstaticfriction_1 = 0;
                        var frestitution_1 = 0;
                        var ftrigger_1 = false;
                        var fcount_1 = 0;
                        // Note: Bullet Physics Center Mass Must Offset Meshes (No Working Set Center Mass Property Support)
                        var center_1 = (metadata.physics != null && metadata.physics.center != null) ? BABYLON.Utilities.ParseVector3(metadata.physics.center, BABYLON.Vector3.Zero()) : BABYLON.Vector3.Zero();
                        var centernodes = entity.getChildren(null, true);
                        if (centernodes != null && centernodes.length > 0) {
                            centernodes.forEach(function (centernode) { centernode.position.subtractInPlace(center_1); });
                        }
                        var childnodes = entity.getChildren(null, false);
                        if (childnodes != null && childnodes.length > 0) {
                            childnodes.forEach(function (childnode) {
                                if (childnode.metadata != null && childnode.metadata.unity != null) {
                                    if (childnode.metadata.unity.collision != null) {
                                        var ccollision = childnode.metadata.unity.collision;
                                        var cwheelinformation = (ccollision.wheelinformation != null) ? ccollision.wheelinformation : null;
                                        if (cwheelinformation != null) {
                                            // Trace Wheel Collider
                                            // BABYLON.SceneManager.LogWarning(">>> Setup raycast wheel collider: " + childnode.name + " --> on to: " + entity.name);
                                            if (fwheels_1 == null)
                                                fwheels_1 = [];
                                            fwheels_1.push(cwheelinformation);
                                        }
                                        else {
                                            var cdynamicfriction = (ccollision.dynamicfriction != null) ? ccollision.dynamicfriction : 0.6;
                                            var cstaticfriction = (ccollision.staticfriction != null) ? ccollision.staticfriction : 0.6;
                                            var crestitution = (ccollision.restitution != null) ? ccollision.restitution : 0;
                                            var cistrigger = (ccollision.trigger != null) ? ccollision.trigger : false;
                                            var ccollider = (ccollision.type != null) ? ccollision.type : "BoxCollider";
                                            var cimpostortype = BABYLON.PhysicsImpostor.BoxImpostor;
                                            if (ccollider === "MeshCollider") {
                                                // Note: Always Force Convex Hull Impostor Usage
                                                cimpostortype = BABYLON.PhysicsImpostor.ConvexHullImpostor;
                                            }
                                            else if (ccollider === "CapsuleCollider") {
                                                cimpostortype = BABYLON.PhysicsImpostor.CapsuleImpostor;
                                            }
                                            else if (ccollider === "SphereCollider") {
                                                cimpostortype = BABYLON.PhysicsImpostor.SphereImpostor;
                                            }
                                            else {
                                                cimpostortype = BABYLON.PhysicsImpostor.BoxImpostor;
                                            }
                                            if (cdynamicfriction > fdynamicfriction_1)
                                                fdynamicfriction_1 = cdynamicfriction;
                                            if (cstaticfriction > fstaticfriction_1)
                                                fstaticfriction_1 = cstaticfriction;
                                            if (crestitution > frestitution_1)
                                                frestitution_1 = crestitution;
                                            if (cistrigger == true)
                                                ftrigger_1 = true;
                                            // Trace Compound Collider
                                            // BABYLON.SceneManager.LogWarning(">>> Setup " + BABYLON.SceneManager.GetPhysicsImposterType(cimpostortype).toLowerCase() + " compound imposter for: " + childnode.name);
                                            BABYLON.SceneManager.CreatePhysicsImpostor(scene, childnode, cimpostortype, { mass: 0, friction: 0, restitution: 0 });
                                            BABYLON.RigidbodyPhysics.ConfigRigidbodyPhysics(scene, childnode, true, false, metadata.physics);
                                            fcount_1++;
                                        }
                                    }
                                }
                            });
                        }
                        if (fcount_1 > 0) {
                            // Trace Physics Root
                            // BABYLON.SceneManager.LogWarning(">>> Setup physics root no imposter for: " + entity.name);
                            BABYLON.SceneManager.CreatePhysicsImpostor(scene, entity, BABYLON.PhysicsImpostor.NoImpostor, { mass: mass, friction: fdynamicfriction_1, restitution: frestitution_1 });
                            BABYLON.RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, ftrigger_1, metadata.physics);
                        }
                        if (fwheels_1 != null && fwheels_1.length > 0) {
                            if (entity.metadata == null)
                                entity.metadata = {};
                            if (entity.metadata.unity == null)
                                entity.metadata.unity = {};
                            entity.metadata.unity.wheels = fwheels_1;
                        }
                        childnodes = null;
                    }
                    else if (metadata.collision != null) {
                        var collider = (metadata.collision.type != null) ? metadata.collision.type : "BoxCollider";
                        var convexmesh = (metadata.collision.convexmesh != null) ? metadata.collision.convexmesh : false;
                        var dynamicfriction = (metadata.collision.dynamicfriction != null) ? metadata.collision.dynamicfriction : 0.6;
                        var staticfriction = (metadata.collision.staticfriction != null) ? metadata.collision.staticfriction : 0.6;
                        var restitution = (metadata.collision.restitution != null) ? metadata.collision.restitution : 0;
                        var istrigger = (metadata.collision.trigger != null) ? metadata.collision.trigger : false;
                        var impostortype = BABYLON.PhysicsImpostor.BoxImpostor;
                        // Config Physics Impostor
                        if (collider === "MeshCollider") {
                            impostortype = (convexmesh === true) ? BABYLON.PhysicsImpostor.ConvexHullImpostor : BABYLON.PhysicsImpostor.MeshImpostor;
                        }
                        else if (collider === "CapsuleCollider") {
                            impostortype = BABYLON.PhysicsImpostor.CapsuleImpostor;
                        }
                        else if (collider === "SphereCollider") {
                            impostortype = BABYLON.PhysicsImpostor.SphereImpostor;
                        }
                        else {
                            impostortype = BABYLON.PhysicsImpostor.BoxImpostor;
                        }
                        // Trace Physics Impostor
                        // BABYLON.SceneManager.LogWarning(">>> Setup " + BABYLON.SceneManager.GetPhysicsImposterType(impostortype).toLowerCase() + " physics impostor for: " + entity.name);
                        BABYLON.SceneManager.CreatePhysicsImpostor(scene, entity, impostortype, { mass: mass, friction: (isstatic) ? staticfriction : dynamicfriction, restitution: restitution });
                        BABYLON.RigidbodyPhysics.ConfigRigidbodyPhysics(scene, entity, false, istrigger, metadata.physics);
                    }
                }
            }
        };
        RigidbodyPhysics.ConfigRigidbodyPhysics = function (scene, entity, child, trigger, physics) {
            if (entity == null)
                return;
            if (entity.physicsImpostor != null) {
                entity.physicsImpostor.executeNativeFunction(function (word, body) {
                    if (body.activate)
                        body.activate();
                    var colobj = Ammo.castObject(body, Ammo.btCollisionObject);
                    colobj.entity = entity;
                    // ..
                    // Legacy Edge Contact (DEPRECIATED: KEEP FOR REFERENCE)
                    // ..
                    //const world:any = BABYLON.SceneManager.GetPhysicsWorld(scene);
                    //if (world != null && world.generateInternalEdgeInfo) {
                    //    const collisionShape:any = colobj.getCollisionShape();
                    //    if (collisionShape != null && collisionShape.getShapeType) {
                    //        const shapeType:number = collisionShape.getShapeType();
                    //        if (shapeType === 21) { // TRIANGLE_MESH_SHAPE_PROXYTYPE
                    //            const triangleShape:any = Ammo.castObject(collisionShape, Ammo.btBvhTriangleMeshShape);
                    //            if (triangleShape != null) {
                    //                colobj.triangleMapInfo = new Ammo.btTriangleInfoMap();
                    //                world.generateInternalEdgeInfo(triangleShape, colobj.triangleMapInfo);
                    //            }
                    //        }
                    //    }
                    //}
                    // ..
                    // Setup Main Gravity
                    // ..
                    var gravity = (physics != null && physics.gravity != null) ? physics.gravity : true;
                    if (gravity === false) {
                        if (body.setGravity) {
                            if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                                BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                            BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(0, 0, 0);
                            body.setGravity(BABYLON.RigidbodyPhysics.TempAmmoVector);
                        }
                        else {
                            BABYLON.Tools.Warn("Physics engine set gravity override not supported for: " + entity.name);
                        }
                    }
                    // ..
                    // Setup Drag Damping
                    // ..
                    if (body.setDamping) {
                        var ldrag = (physics != null && physics.ldrag != null) ? physics.ldrag : 0;
                        var adrag = (physics != null && physics.adrag != null) ? physics.adrag : 0.05;
                        body.setDamping(ldrag, adrag);
                    }
                    else {
                        BABYLON.Tools.Warn("Physics engine set drag damping not supported for: " + entity.name);
                    }
                    // ..
                    // Setup Collision Flags
                    // ..
                    if (body.setCollisionFlags && body.getCollisionFlags) {
                        // DEPRECIATED: if (trigger === true) body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_NO_CONTACT_RESPONSE | BABYLON.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK);
                        // DEPRECIATED: else body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK);
                        // TODO: if (mass === 0) body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_KINEMATIC_OBJECT); // STATIC_OBJECT
                        if (trigger === true)
                            body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_NO_CONTACT_RESPONSE); // TRIGGER_OBJECT
                        body.setCollisionFlags(body.getCollisionFlags() | BABYLON.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK); // CUSTOM_MATERIAL
                    }
                    else {
                        BABYLON.Tools.Warn("Physics engine set collision flags not supported for: " + entity.name);
                    }
                    // ..
                    // Setup Freeze Constraints
                    // ..
                    var freeze = (physics != null && physics.freeze != null) ? physics.freeze : null;
                    if (freeze != null) {
                        if (body.setLinearFactor) {
                            var freeze_pos_x = (freeze.positionx != null && freeze.positionx === true) ? 0 : 1;
                            var freeze_pos_y = (freeze.positiony != null && freeze.positiony === true) ? 0 : 1;
                            var freeze_pos_z = (freeze.positionz != null && freeze.positionz === true) ? 0 : 1;
                            if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                                BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                            BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(freeze_pos_x, freeze_pos_y, freeze_pos_z);
                            body.setLinearFactor(BABYLON.RigidbodyPhysics.TempAmmoVector);
                        }
                        else {
                            BABYLON.Tools.Warn("Physics engine set linear factor not supported for: " + entity.name);
                        }
                        if (body.setAngularFactor) {
                            var freeze_rot_x = (freeze.rotationx != null && freeze.rotationx === true) ? 0 : 1;
                            var freeze_rot_y = (freeze.rotationy != null && freeze.rotationy === true) ? 0 : 1;
                            var freeze_rot_z = (freeze.rotationz != null && freeze.rotationz === true) ? 0 : 1;
                            if (BABYLON.RigidbodyPhysics.TempAmmoVector == null)
                                BABYLON.RigidbodyPhysics.TempAmmoVector = new Ammo.btVector3(0, 0, 0);
                            BABYLON.RigidbodyPhysics.TempAmmoVector.setValue(freeze_rot_x, freeze_rot_y, freeze_rot_z);
                            body.setAngularFactor(BABYLON.RigidbodyPhysics.TempAmmoVector);
                        }
                        else {
                            BABYLON.Tools.Warn("Physics engine set angular factor not supported for: " + entity.name);
                        }
                    }
                });
            }
            else {
                BABYLON.Tools.Warn("No valid physics impostor to setup for " + entity.name);
            }
        };
        RigidbodyPhysics.TempAmmoVector = null;
        RigidbodyPhysics.TempAmmoVectorAux = null;
        RigidbodyPhysics.TempCenterTransform = null;
        return RigidbodyPhysics;
    }(BABYLON.ScriptComponent));
    BABYLON.RigidbodyPhysics = RigidbodyPhysics;
    /**
     * Babylon collision contact info pro class (Native Bullet Physics 2.82)
     * @class CollisionContactInfo - All rights reserved (c) 2020 Mackey Kinard
     */
    var CollisionContactInfo = /** @class */ (function () {
        function CollisionContactInfo() {
            this.mesh = null;
            this.state = 0;
            this.reset = false;
        }
        return CollisionContactInfo;
    }());
    BABYLON.CollisionContactInfo = CollisionContactInfo;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon shuriken particle system pro class (Unity Style Shuriken Particle System)
     * @class ShurikenParticles - All rights reserved (c) 2020 Mackey Kinard
     */
    var ShurikenParticles = /** @class */ (function (_super) {
        __extends(ShurikenParticles, _super);
        function ShurikenParticles() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ShurikenParticles.prototype.awake = function () { };
        ShurikenParticles.prototype.start = function () { };
        ShurikenParticles.prototype.ready = function () { };
        ShurikenParticles.prototype.update = function () { };
        ShurikenParticles.prototype.late = function () { };
        ShurikenParticles.prototype.after = function () { };
        ShurikenParticles.prototype.fixed = function () { };
        ShurikenParticles.prototype.destroy = function () { };
        return ShurikenParticles;
    }(BABYLON.ScriptComponent));
    BABYLON.ShurikenParticles = ShurikenParticles;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon terrain building system pro class (Unity Style Terrain Building System)
     * @class TerrainGenerator - All rights reserved (c) 2020 Mackey Kinard
     */
    var TerrainGenerator = /** @class */ (function (_super) {
        __extends(TerrainGenerator, _super);
        function TerrainGenerator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.treeInstances = null;
            return _this;
        }
        TerrainGenerator.prototype.awake = function () {
            /* Init component function */
            // TESTING ONLY: const trees = this.getChildNode("_trees", BABYLON.SearchType.EndsWith, true);
            // TESTING ONLY: if (trees != null) this.treeInstances = trees.getChildren(null, true) as BABYLON.TransformNode[];
            console.log("Terrain Generator: " + this.transform.name);
            console.log(this);
        };
        TerrainGenerator.prototype.start = function () {
            /* Start render loop function */
        };
        TerrainGenerator.prototype.ready = function () {
            /* Execute when ready function */
        };
        TerrainGenerator.prototype.update = function () {
            /* Update render loop function */
        };
        TerrainGenerator.prototype.late = function () {
            /* Late update render loop function */
        };
        TerrainGenerator.prototype.after = function () {
            /* After update render loop function */
        };
        TerrainGenerator.prototype.fixed = function () {
            /* Fixed update physics step function */
        };
        TerrainGenerator.prototype.destroy = function () {
            /* Destroy component function */
        };
        return TerrainGenerator;
    }(BABYLON.ScriptComponent));
    BABYLON.TerrainGenerator = TerrainGenerator;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    /**
     * Babylon web video player pro class (Unity Style Shuriken Particle System)
     * @class WebVideoPlayer - All rights reserved (c) 2020 Mackey Kinard
     */
    var WebVideoPlayer = /** @class */ (function (_super) {
        __extends(WebVideoPlayer, _super);
        function WebVideoPlayer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.videoLoop = false;
            _this.videoMuted = false;
            _this.videoAlpha = false;
            _this.videoFaded = false;
            _this.videoPoster = null;
            _this.videoInvert = true;
            _this.videoSample = 3;
            _this.videoVolume = 1.0;
            _this.videoMipmaps = false;
            _this.videoPlayback = 1.0;
            _this.videoPlayOnAwake = true;
            _this.videoPreloaderUrl = null;
            _this.videoBlobUrl = null;
            _this.videoPreload = false;
            _this._initializedReadyInstance = false;
            /** Register handler that is triggered when the video clip is ready */
            _this.onReadyObservable = new BABYLON.Observable();
            _this.m_abstractMesh = null;
            _this.m_videoTexture = null;
            _this.m_videoMaterial = null;
            _this.m_diffuseIntensity = 1.0;
            return _this;
        }
        WebVideoPlayer.prototype.getVideoMaterial = function () { return this.m_videoMaterial; };
        WebVideoPlayer.prototype.getVideoTexture = function () { return this.m_videoTexture; };
        WebVideoPlayer.prototype.getVideoElement = function () { return (this.m_videoTexture != null) ? this.m_videoTexture.video : null; };
        WebVideoPlayer.prototype.getVideoScreen = function () { return this.m_abstractMesh; };
        WebVideoPlayer.prototype.getVideoBlobUrl = function () { return this.videoBlobUrl; };
        WebVideoPlayer.prototype.awake = function () { this.awakeWebVideoPlayer(); };
        WebVideoPlayer.prototype.destroy = function () { this.destroyWebVideoPlayer(); };
        WebVideoPlayer.prototype.awakeWebVideoPlayer = function () {
            this.videoLoop = this.getProperty("looping", false);
            this.videoMuted = this.getProperty("muted", false);
            this.videoInvert = this.getProperty("inverty", true);
            this.videoSample = this.getProperty("sampling", 3);
            this.videoVolume = this.getProperty("volume", 1.0);
            this.videoMipmaps = this.getProperty("mipmaps", false);
            this.videoAlpha = this.getProperty("texturealpha", false);
            this.videoFaded = this.getProperty("diffusealpha", false);
            this.videoPlayback = this.getProperty("playbackspeed", 1.0);
            this.videoPlayOnAwake = this.getProperty("playonawake", true);
            this.videoPreload = this.getProperty("preload", this.videoPreload);
            this.m_diffuseIntensity = this.getProperty("intensity", 1.0);
            this.m_abstractMesh = this.getAbstractMesh();
            // ..
            var setPoster = this.getProperty("poster");
            if (setPoster === true && this.m_abstractMesh != null && this.m_abstractMesh.material != null) {
                if (this.m_abstractMesh.material instanceof BABYLON.PBRMaterial) {
                    if (this.m_abstractMesh.material.albedoTexture != null && this.m_abstractMesh.material.albedoTexture.url != null && this.m_abstractMesh.material.albedoTexture.url !== "") {
                        this.videoPoster = this.m_abstractMesh.material.albedoTexture.url.replace("data:", "");
                    }
                }
                else if (this.m_abstractMesh.material instanceof BABYLON.StandardMaterial) {
                    if (this.m_abstractMesh.material.diffuseTexture != null && this.m_abstractMesh.material.diffuseTexture.url != null && this.m_abstractMesh.material.diffuseTexture.url !== "") {
                        this.videoPoster = this.m_abstractMesh.material.diffuseTexture.url.replace("data:", "");
                    }
                }
            }
            // ..
            var videoUrl = this.getProperty("url", null);
            var videoSrc = this.getProperty("source", null);
            var playUrl = videoUrl;
            if (videoSrc != null && videoSrc.filename != null && videoSrc.filename !== "") {
                var rootUrl = BABYLON.SceneManager.GetRootUrl(this.scene);
                playUrl = (rootUrl + videoSrc.filename);
            }
            if (playUrl != null && playUrl !== "") {
                if (this.videoPreload === true) {
                    this.videoPreloaderUrl = playUrl;
                }
                else {
                    this.setDataSource(playUrl);
                }
            }
        };
        WebVideoPlayer.prototype.destroyWebVideoPlayer = function () {
            this.m_abstractMesh = null;
            if (this.m_videoTexture != null) {
                this.m_videoTexture.dispose();
                this.m_videoTexture = null;
            }
            if (this.m_videoMaterial != null) {
                this.m_videoMaterial.dispose();
                this.m_videoMaterial = null;
            }
            this.revokeVideoBlobUrl();
        };
        /**
         * Gets the video ready status
         */
        WebVideoPlayer.prototype.isReady = function () {
            return (this.getVideoElement() != null);
        };
        /**
         * Gets the video playing status
         */
        WebVideoPlayer.prototype.isPlaying = function () {
            var result = false;
            var video = this.getVideoElement();
            if (video != null) {
                result = (video.paused === false);
            }
            return result;
        };
        /**
         * Gets the video paused status
         */
        WebVideoPlayer.prototype.isPaused = function () {
            var result = false;
            var video = this.getVideoElement();
            if (video != null) {
                result = (video.paused === true);
            }
            return result;
        };
        /**
         * Play the video track
         */
        WebVideoPlayer.prototype.play = function () {
            var _this = this;
            if (BABYLON.SceneManager.HasAudioContext()) {
                this.internalPlay();
            }
            else {
                BABYLON.Engine.audioEngine.onAudioUnlockedObservable.addOnce(function () { _this.internalPlay(); });
            }
            return true;
        };
        WebVideoPlayer.prototype.internalPlay = function () {
            var _this = this;
            if (this._initializedReadyInstance === true) {
                this.checkedPlay();
            }
            else {
                this.onReadyObservable.addOnce(function () { _this.checkedPlay(); });
            }
        };
        WebVideoPlayer.prototype.checkedPlay = function () {
            var _this = this;
            var video = this.getVideoElement();
            if (video != null) {
                video.play().then(function () {
                    if (video.paused === true) {
                        _this.checkedRePlay();
                    }
                });
            }
        };
        WebVideoPlayer.prototype.checkedRePlay = function () {
            var video = this.getVideoElement();
            if (video != null) {
                video.play().then(function () { });
            }
        };
        /**
         * Pause the video track
         */
        WebVideoPlayer.prototype.pause = function () {
            var result = false;
            var video = this.getVideoElement();
            if (video != null) {
                video.pause();
                result = true;
            }
            return result;
        };
        /**
         * Mute the video track
         */
        WebVideoPlayer.prototype.mute = function () {
            var result = false;
            var video = this.getVideoElement();
            if (video != null) {
                video.muted = true;
                result = true;
            }
            return result;
        };
        /**
         * Unmute the video track
         */
        WebVideoPlayer.prototype.unmute = function () {
            var result = false;
            var video = this.getVideoElement();
            if (video != null) {
                video.muted = false;
                result = true;
            }
            return result;
        };
        /**
         * Gets the video volume
         */
        WebVideoPlayer.prototype.getVolume = function () {
            var result = 0;
            var video = this.getVideoElement();
            if (video != null) {
                result = video.volume;
            }
            return result;
        };
        /**
         * Sets the video volume
         * @param volume Define the new volume of the sound
         */
        WebVideoPlayer.prototype.setVolume = function (volume) {
            var result = false;
            var video = this.getVideoElement();
            if (video != null) {
                video.volume = volume;
                result = true;
            }
            return result;
        };
        /** Set video data source */
        WebVideoPlayer.prototype.setDataSource = function (source) {
            var _this = this;
            if (this.m_abstractMesh != null) {
                // ..
                // Create Video Material
                // ..
                if (this.m_videoMaterial == null) {
                    this.m_videoMaterial = new BABYLON.StandardMaterial(this.transform.name + ".VideoMat", this.scene);
                    this.m_videoMaterial.roughness = 1;
                    this.m_videoMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
                    this.m_videoMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
                    this.m_videoMaterial.useAlphaFromDiffuseTexture = this.videoFaded;
                    this.m_abstractMesh.material = this.m_videoMaterial;
                }
                // ..
                // Setup Video Texture
                // ..
                if (this.m_videoMaterial != null) {
                    this.m_videoMaterial.diffuseTexture = null;
                    if (this.m_videoTexture != null) {
                        this.m_videoTexture.dispose();
                        this.m_videoTexture = null;
                    }
                    this._initializedReadyInstance = false;
                    this.m_videoTexture = new BABYLON.VideoTexture(this.transform.name + ".VideoTex", source, this.scene, this.videoMipmaps, this.videoInvert, this.videoSample, { autoUpdateTexture: true, poster: this.videoPoster });
                    if (this.m_videoTexture != null) {
                        this.m_videoTexture.hasAlpha = this.videoAlpha;
                        if (this.m_videoTexture.video != null) {
                            this.m_videoTexture.video.loop = this.videoLoop;
                            this.m_videoTexture.video.muted = this.videoMuted;
                            this.m_videoTexture.video.volume = this.videoVolume;
                            this.m_videoTexture.video.playbackRate = this.videoPlayback;
                            this.m_videoTexture.video.addEventListener("loadeddata", function () {
                                _this._initializedReadyInstance = true;
                                if (_this.onReadyObservable.hasObservers() === true) {
                                    _this.onReadyObservable.notifyObservers(_this.m_videoTexture);
                                }
                                if (_this.videoPlayOnAwake === true) {
                                    _this.play();
                                }
                            });
                            this.m_videoTexture.video.load();
                        }
                    }
                    if (this.m_videoTexture != null) {
                        this.m_videoTexture.level = this.m_diffuseIntensity;
                        this.m_videoMaterial.diffuseTexture = this.m_videoTexture;
                    }
                }
                else {
                    BABYLON.Tools.Warn("No video mesh or material available for: " + this.transform.name);
                }
            }
        };
        /** Revokes the current video blob url and releases resouces */
        WebVideoPlayer.prototype.revokeVideoBlobUrl = function () {
            if (this.videoBlobUrl != null) {
                URL.revokeObjectURL(this.videoBlobUrl);
                this.videoBlobUrl = null;
            }
        };
        /** Add video preloader asset tasks (https://doc.babylonjs.com/divingDeeper/importers/assetManager) */
        WebVideoPlayer.prototype.addPreloaderTasks = function (assetsManager) {
            var _this = this;
            if (this.videoPreload === true) {
                var assetTask = assetsManager.addBinaryFileTask((this.transform.name + ".VideoTask"), this.videoPreloaderUrl);
                assetTask.onSuccess = function (task) {
                    _this.revokeVideoBlobUrl();
                    _this.videoBlobUrl = URL.createObjectURL(new Blob([task.data]));
                    _this.setDataSource(_this.videoBlobUrl);
                };
                assetTask.onError = function (task, message, exception) { console.error(message, exception); };
            }
        };
        return WebVideoPlayer;
    }(BABYLON.ScriptComponent));
    BABYLON.WebVideoPlayer = WebVideoPlayer;
})(BABYLON || (BABYLON = {}));


// Project Shader Fixes
if (BABYLON.Effect.IncludesShadersStore["pbrBlockFinalColorComposition"]) BABYLON.Effect.IncludesShadersStore["pbrBlockFinalColorComposition"] = BABYLON.Effect.IncludesShadersStore["pbrBlockFinalColorComposition"].replace("finalColor.rgb*=lightmapColor.rgb", "finalColor.rgb*=(lightmapColor.rgb+finalEmissive.rgb)");
if (BABYLON.Effect.ShadersStore["defaultPixelShader"]) BABYLON.Effect.ShadersStore["defaultPixelShader"] = BABYLON.Effect.ShadersStore["defaultPixelShader"].replace("color.rgb *= lightmapColor.rgb", "color.rgb *= (lightmapColor.rgb + finalEmissive.rgb)");
