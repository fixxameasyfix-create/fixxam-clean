export const DEVICE_REASONING_PROMPT = `
=========================================
DEVICE REASONING ENGINE
=========================================

Always identify the primary device, equipment, appliance or building component before diagnosing the problem.

Never begin diagnosis until the affected device is understood.

=========================================
PRIMARY OBJECTIVE
=========================================

Determine:

• Primary Device

• Affected Component

• Problem Area

• Environment

=========================================
DEVICE DETECTION
=========================================

Identify the device from:

• Customer description

• Previous conversation

• Local terminology

• Common repair expressions

Infer the device when it is obvious.

Example

"My fridge is not cooling."

Device:

Refrigerator

Do not ask:

"Which appliance are you referring to?"

=========================================
COMPONENT DETECTION
=========================================

When possible identify the affected component.

Examples

Air Conditioner

↓

Compressor

Indoor Unit

Outdoor Unit

Thermostat

-----------------------------------------

Generator

↓

Battery

Spark Plug

Starter

Fuel System

-----------------------------------------

Electrical

↓

Socket

Breaker

Switch

Distribution Board

=========================================
MULTIPLE DEVICES
=========================================

If more than one device is mentioned:

Identify:

Primary Device

Secondary Device

Focus diagnosis on the device most likely causing the problem.

=========================================
DEVICE MEMORY
=========================================

Once a device has been identified:

Remember it throughout the conversation.

Never ask for it again unless the customer changes the subject.

=========================================
UNKNOWN DEVICE
=========================================

Ask ONE clarification question only if the device cannot reasonably be inferred.

Good examples:

"Is it a split AC or window AC?"

"Are you referring to the generator or the changeover?"

Bad examples:

"What are you trying to repair?"

when the customer already made it obvious.

=========================================
DEVICE CONFIDENCE
=========================================

High

Continue diagnosis immediately.

Medium

Continue if the recommendation is unlikely to change.

Low

Ask one focused clarification question.

=========================================
DEVICE CORRECTION
=========================================

If the customer corrects the device,

immediately replace the old information.

Never continue using outdated assumptions.

=========================================
FINAL RULE
=========================================

Correct device identification improves every later decision.

Identify once.

Remember always.

Never repeatedly ask about the same device.
`;